# Security Specification - Lyra Firestore Security

This document outlines the security architecture, invariants, attack vectors, and testing payloads for the Lyra database.

---

## 1. Data Invariants

- **User Profiles (`/users/{userId}`)**:
  - Access is strictly owner-only. An authenticated user can only get, list, create, or update a user document where the document ID `userId` is equal to `request.auth.uid`.
  - The user's email must be verified (`request.auth.token.email_verified == true`).
  - `createdAt` is immutable.
  - Users cannot spoof their profile information.

- **Lessons (`/lessons/{lessonId}`)**:
  - Access is strictly owner-only. An authenticated user can only read, list, write, or delete lessons where the `userId` in the document matches `request.auth.uid`.
  - The lesson must conform to type, structure, and size boundaries to prevent "Denial of Wallet" resource consumption.
  - `createdAt` and `userId` are immutable.
  - All updates to lessons must be validated against `isValidLesson()` and enforce server-defined updates.

---

## 2. The "Dirty Dozen" Payloads

Here are twelve payloads designed to exploit potential vulnerabilities. All of these MUST result in `PERMISSION_DENIED` under the security rules.

### Payload 1: User Identity Spoofing (Creating user profile for someone else)
- **Target Path**: `/users/victim_user_123`
- **Auth context**: Signed in as `attacker_user_456`
- **Payload**:
  ```json
  {
    "uid": "victim_user_123",
    "email": "victim@example.com",
    "displayName": "Victim User",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: `userId` path variable does not match `request.auth.uid`.

### Payload 2: Email Verification Spoof (Action by unverified user)
- **Target Path**: `/users/unverified_123`
- **Auth context**: Signed in as `unverified_123` but `email_verified: false`
- **Payload**:
  ```json
  {
    "uid": "unverified_123",
    "email": "unverified@example.com",
    "displayName": "Unverified User",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: `request.auth.token.email_verified` must be `true`.

### Payload 3: User Profile Immutability Break (Attempting to modify `createdAt` on update)
- **Target Path**: `/users/active_user_123`
- **Auth context**: Signed in as `active_user_123`
- **Payload**:
  ```json
  {
    "uid": "active_user_123",
    "email": "user@example.com",
    "displayName": "Updated Name",
    "createdAt": "2020-01-01T00:00:00Z", // Attacking immutability
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: `incoming().createdAt == existing().createdAt` must be enforced.

### Payload 4: Lesson Ownership Hijacking (Creating a lesson assigned to another user)
- **Target Path**: `/lessons/lesson_999`
- **Auth context**: Signed in as `attacker_user_456`
- **Payload**:
  ```json
  {
    "id": "lesson_999",
    "userId": "victim_user_123", // Spoofed owner
    "lessonTitle": "STEM Solar Energy",
    "duration": "45 minutes",
    "summary": "Introduction to photovoltaic cells",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: Inbound `userId` field must match `request.auth.uid`.

### Payload 5: Resource Poisoning (Denial of Wallet via oversized string)
- **Target Path**: `/lessons/lesson_101`
- **Auth context**: Signed in as `user_123`
- **Payload**:
  ```json
  {
    "id": "lesson_101",
    "userId": "user_123",
    "lessonTitle": "VERY_LONG_STRING_REPEATED_FOR_10_MEGABYTES...",
    "duration": "45 mins",
    "summary": "Short summary",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: `incoming().lessonTitle.size() <= 200` must be enforced.

### Payload 6: Missing Required Fields (Schema Violation)
- **Target Path**: `/lessons/lesson_102`
- **Auth context**: Signed in as `user_123`
- **Payload**:
  ```json
  {
    "id": "lesson_102",
    "userId": "user_123"
    // Missing lessonTitle, duration, summary, timestamps
  }
  ```
- **Reason to fail**: Must contain all required keys with exact length limits.

### Payload 7: Lesson Reading Leak (Unauthorized collection query/get)
- **Target Path**: `/lessons/victim_lesson_777` (Owned by `victim_user_123`)
- **Auth context**: Signed in as `attacker_user_456`
- **Payload**: None (GET operation)
- **Reason to fail**: `resource.data.userId == request.auth.uid` must be true.

### Payload 8: Lesson Cross-Write (Unauthorized update)
- **Target Path**: `/lessons/victim_lesson_777` (Owned by `victim_user_123`)
- **Auth context**: Signed in as `attacker_user_456`
- **Payload**:
  ```json
  {
    "id": "victim_lesson_777",
    "userId": "victim_user_123",
    "lessonTitle": "Defaced Lesson Title",
    "duration": "5 minutes",
    "summary": "Hacked",
    "createdAt": "2026-01-01T12:00:00Z",
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: Cannot modify document unless `existing().userId == request.auth.uid`.

### Payload 9: Value Type Poisoning (Injecting array into string field)
- **Target Path**: `/lessons/lesson_202`
- **Auth context**: Signed in as `user_123`
- **Payload**:
  ```json
  {
    "id": "lesson_202",
    "userId": "user_123",
    "lessonTitle": ["Hacked", "Title", "Array"], // Array instead of String
    "duration": "45 mins",
    "summary": "Short summary",
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: `incoming().lessonTitle is string` must be verified.

### Payload 10: Client Timestamp Injection
- **Target Path**: `/lessons/lesson_203`
- **Auth context**: Signed in as `user_123`
- **Payload**:
  ```json
  {
    "id": "lesson_203",
    "userId": "user_123",
    "lessonTitle": "Valid Title",
    "duration": "45 mins",
    "summary": "Short summary",
    "createdAt": "request.time",
    "updatedAt": "2010-01-01T00:00:00Z" // Outdated client time
  }
  ```
- **Reason to fail**: `incoming().updatedAt == request.time` is required.

### Payload 11: Document ID Poisoning (Malicious ID containing directory traversals/special chars)
- **Target Path**: `/lessons/../../etc/passwd`
- **Auth context**: Signed in as `user_123`
- **Payload**: Standard valid Lesson JSON
- **Reason to fail**: `isValidId()` check restricts characters to `^[a-zA-Z0-9_\-]+$` and length `<= 128`.

### Payload 12: Ownership Theft on Update (Modifying `userId` of an existing lesson)
- **Target Path**: `/lessons/my_lesson_555`
- **Auth context**: Signed in as `user_123`
- **Payload**:
  ```json
  {
    "id": "my_lesson_555",
    "userId": "attacker_user_456", // Attempting to transfer ownership
    "lessonTitle": "Transferring Ownership",
    "duration": "45 mins",
    "summary": "Short summary",
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "request.time"
  }
  ```
- **Reason to fail**: `incoming().userId == existing().userId` is required.

---

## 3. Test Runner Design

Below is a complete test model using the Firebase Firestore rules unit testing structure:

```ts
// firestore.rules.test.ts
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "gen-lang-client-0481032669",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Lyra Security Rules Tests", () => {
  test("Payload 1: Reject user profile creation for other user IDs", async () => {
    const attackerContext = testEnv.authenticatedContext("attacker_user_456", { email_verified: true });
    const db = attackerContext.firestore();
    const victimRef = doc(db, "users", "victim_user_123");
    
    await expect(setDoc(victimRef, {
      uid: "victim_user_123",
      email: "victim@example.com",
      displayName: "Victim User",
      createdAt: new Date(),
      updatedAt: new Date()
    })).rejects.toThrow();
  });

  test("Payload 4: Reject lesson creation with spoofed userId field", async () => {
    const attackerContext = testEnv.authenticatedContext("attacker_user_456", { email_verified: true });
    const db = attackerContext.firestore();
    const lessonRef = doc(db, "lessons", "lesson_999");

    await expect(setDoc(lessonRef, {
      id: "lesson_999",
      userId: "victim_user_123",
      lessonTitle: "STEM Solar Energy",
      duration: "45 minutes",
      summary: "Introduction to photovoltaic cells",
      createdAt: new Date(),
      updatedAt: new Date()
    })).rejects.toThrow();
  });
});
```

# Firestore Security Specifications

## 1. Data Invariants
- **Authentication**: All read and write operations require valid authenticated accounts with checked email status if required.
- **Identity Integrity**: Users can only access, view, create, or update their own user profiles, cart items, or purchase orders. Setting UIDs to other users' variables is strictly blocked.
- **State Inmutability**: `createdAt` and `userId` fields inside user documents and orders cannot be edited post-facto.
- **Temporal Check**: Dates and updates must synchronize with the valid server request timestamp.

## 2. The "Dirty Dozen" Payloads
These payloads attempt to break access rules, escalate roles, or inject junk data.

1. **Profile Spoofing Profile**: Creating/updating a user profile with `userId` of another pilot.
2. **Infinite Cart Loading**: Injecting massive size or junk character IDs into the cart item ID to execute denial-of-wallet attacks.
3. **Ghost Cart Items**: Creating a cart item for another user's subcollection.
4. **Order State Bypass**: Directly modifying an existing order's status to "Completed" or "Delivered" from the client.
5. **Unauthorized Order Read**: Querying order documents from a different pilot's subcollection.
6. **Price Spoofing**: Inserting a negative or zero total inside the order document.
7. **Cross-User Writing**: Submitting a cart update where the item points to a foreign subcollection.
8. **Invalid Format ID**: Overwriting keys under `/users/` using invalid system IDs like `*admin*` or space characters.
9. **Creation Timestamp Manipulation**: Providing an arbitrary client date in the future for `createdAt` instead of server time.
10. **Bypassing Verification**: Attempting to execute writes with an unverified or fake email signature.
11. **Shadow System Privileges**: Creating a user profile document with sub-field elements like `role: "admin"` to escalate privileges.
12. **Orphaned State Checkout**: Forcing checkout logic before placing any items in the synchronized active cart collection.

---

## 3. Test Cases Configuration Checklist
All tests must result in `PERMISSION_DENIED`:
- Reject profile write for UID mismatch
- Reject cross-user cart retrieval
- Reject orders state mutation by non-authorized users
- Reject string lengths exceeding database limits

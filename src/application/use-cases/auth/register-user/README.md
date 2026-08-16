# Register user use case

Creates an unverified account, stores a verification token, and sends the signed verify link through the mailer.

## Input

`RegisterUserDto`: email, username, password, confirmPassword.

## Steps

1. Validate email, username, and password through `User.validate`, and add the confirm-password check to the same `Notification`.
2. If the notification has errors, throw `ValidationException`.
3. In one `UnitOfWork`:
   - Reject an email that already exists with `EmailAlreadyExistsException`.
   - Reject a username that already exists with `UsernameAlreadyExistsException`.
   - Hash the password with `PasswordHasher`.
   - Build the `User` and the `VerificationToken`.
   - Save both through `RegisterUserRepository`.
   - Sign the verify URL with `SignedUrl`.
4. Send the signed link through `Mailer` after the transaction commits.

## Ports

`RegisterUserRepository`, `PasswordHasher`, `UnitOfWork`, `Mailer`, `SignedUrl`, `TokenGenerator`.
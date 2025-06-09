// This file contains functions to hash+salt and verify passwords

import bcrypt from "bcrypt";

/**
 * Hashes a password using bcrypt with the userID as salt.
 * @param password - The user's plaintext password.
 * @param userID - The user's unique ID (used as salt).
 * @returns The hashed password.
 */
export async function hashPassword(password: string, userID: string): Promise<string> {
    const saltRounds = 10;
    const saltedPassword = password + userID; // Salt = password + userID
    return await bcrypt.hash(saltedPassword, saltRounds);
}

/**
 * Verifies if the entered password matches the stored hash.
 * @param enteredPassword - The password entered by the user.
 * @param storedHash - The hashed password stored in the database.
 * @param userID - The user's unique ID (used as salt).
 * @returns Boolean indicating if the password is valid.
 */
export async function verifyPassword(
    enteredPassword: string,
    storedHash: string,
    userID: string
): Promise<boolean> {
    const saltedPassword = enteredPassword + userID; // Salt = password + userID
    return await bcrypt.compare(saltedPassword, storedHash);
}

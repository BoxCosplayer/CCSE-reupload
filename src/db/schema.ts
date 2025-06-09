// This file creates the schema and the db functions the APIs can refer to

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Users Table
export const usersTable = sqliteTable('users', {
    id: text('userID').primaryKey(),
    name: text('name').notNull(),
    username: text('username').notNull(),
    password: text('password').notNull(),
    roleID: text('roleID').notNull(),
    addLine1: text('addLine1').notNull(),
    addLine2: text('addLine2'),
    addLine3: text('addLine3'),
    city: text('city').notNull(),
    postcode: text('postcode').notNull(),
});
export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

// Roles Table
export const rolesTable = sqliteTable('roles', {
    roleID: text('roleID').primaryKey(),
    name: text('name').notNull(),
});
export type InsertRole = typeof rolesTable.$inferInsert;
export type SelectRole = typeof rolesTable.$inferSelect;

// Products Table (UPDATED)
export const productsTable = sqliteTable('products', {
    productID: text('productID').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(), // ✅ New field added for product descriptions
    image: text('image').notNull(),
    avgRating: text('avgRating').notNull(),
    sellerID: text('sellerID'),
    stock: integer('stock').notNull(),
    category: text('category').notNull(),
    price: text('price').notNull(),
});
export type InsertProduct = typeof productsTable.$inferInsert;
export type SelectProduct = typeof productsTable.$inferSelect;

// Logs Table (Updated with timestamp)
export const logsTable = sqliteTable("logs", {
    logID: text("logID").primaryKey(),
    userID: text("userID").notNull(),
    eventID: text("eventID").notNull(),
    timestamp: text("timestamp").default(new Date().toISOString()).notNull(), // Add timestamp column
});
export type InsertLog = typeof logsTable.$inferInsert;
export type SelectLog = typeof logsTable.$inferSelect;

// Events Table
export const eventsTable = sqliteTable('events', {
    eventID: text('eventID').primaryKey(),
    description: text('description').notNull(),
});
export type InsertEvent = typeof eventsTable.$inferInsert;
export type SelectEvent = typeof eventsTable.$inferSelect;

// Discounts Table
export const discountsTable = sqliteTable('discounts', {
    discountID: text('discountID').primaryKey(),
    code: text('code').notNull(),
    amount: text('amount').notNull(),
});
export type InsertDiscount = typeof discountsTable.$inferInsert;
export type SelectDiscount = typeof discountsTable.$inferSelect;

// Items-held table
export const itemsHeldTable = sqliteTable('itemsHeld', {
    cartID: text('cartID').primaryKey(),
    userID: text('userID').notNull(),
    productID: text('productID').notNull(),
    amount: integer('amount').notNull(),
});
export type InsertItemHeld = typeof discountsTable.$inferInsert;
export type SelectItemHeld = typeof discountsTable.$inferSelect;
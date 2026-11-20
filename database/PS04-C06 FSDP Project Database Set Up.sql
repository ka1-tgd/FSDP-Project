/*
***ONLY RUN THIS FILE ONCE
This file contains the queries to create the database that will be used for the FSDP Project
Group: PS04-C06
Members: 
	1. Ryan Melvin Rajah (Leader)
	2. Ang Yi Kai
	3. Goh Yi Xuan
	4. Tham Shao Heng
	5. Zeng Wen Shuang
*/

-- Create database
create database FSDPProject_db;
go

use FSDPProject_db;
go

-- Create tables
create table Users (
	NRIC char(9) not null,
	Name varchar(50) not null,
	PhoneNo char(8) not null,
	constraint PK_Users primary key (NRIC),
	constraint UQ_Users_PhoneNo unique (PhoneNo)
);

create table UserLogin (
	UserID varchar(50) not null,
	PasswordHash varchar(255) not null,
	NRIC char(9) not null,
	constraint PK_UserLogin primary key (UserID),
	constraint FK_UserLogin_NRIC foreign key (NRIC) references Users(NRIC),
	constraint UQ_UserLogin_NRIC unique (NRIC)
);

create table Account (
	AccNo varchar(50) not null,
	NRIC char(9) not null,
	Balance decimal(19,2) not null,
	AccType varchar(50) not null,
	UEN char(10) null,
	constraint PK_Account primary key (AccNo),
	constraint FK_Account_NRIC foreign key (NRIC) references Users(NRIC),
	constraint CK_Account_Balance check (Balance >= 0),
	constraint CK_Account_AccType check (AccType in ('Savings', 'Standard', 'Business'))
);

create table Transactions (
	TransRef varchar(50) not null,
	PayerAccNo varchar(50) not null,
	RecipientAccNo varchar(50) not null,
	Description varchar(250) null,
	Amount decimal(19,2) not null,
	Status varchar(20) not null,
	TransDateTime datetime2 not null,
	constraint PK_Transactions primary key (TransRef),
	constraint FK_Transactions_Payer foreign key (PayerAccNo) references Account(AccNo),
	constraint FK_Transactions_Recipient foreign key (RecipientAccNo) references Account(AccNo),
	constraint CK_Transactions_Amount check (Amount > 0),
	constraint CK_Transactions_Status check (Status in ('submitted', 'processing', 'completed', 'failed')),
	constraint CK_Transactions_DiffAcc check (PayerAccNo <> RecipientAccNo)
);

create table Faqs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    question VARCHAR(MAX) NOT NULL,
    answer VARCHAR(MAX) NOT NULL,
    keywords VARCHAR(MAX)
);

-- Create saved contacts table
CREATE TABLE dbo.SavedContacts (
    ContactID INT IDENTITY(1,1) PRIMARY KEY,
    OwnerNRIC CHAR(9) NOT NULL,
    RecipientType VARCHAR(10) NOT NULL,
    RecipientIdentifier VARCHAR(100) NOT NULL,
    SavedName VARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_SavedContacts_Users
        FOREIGN KEY (OwnerNRIC)
        REFERENCES dbo.Users(NRIC),

    CONSTRAINT CK_SavedContacts_Type
        CHECK (RecipientType IN ('NRIC', 'UEN')),

    CONSTRAINT UQ_SavedContacts_Recipient
        UNIQUE (OwnerNRIC, RecipientType, RecipientIdentifier)
);
go

-- Insert sample data
insert into Users (NRIC, Name, PhoneNo)
	values
	('S1234567A', 'John Tan', '12345678'),
	('S7654321B', 'Emily Koh', '87654321'),
	('S1122334C', 'Albert Parke', '11223344'),
	('S5566778D', 'Ben Ng', '55667788'),
	('S1111111E', 'Crystal Lim', '96969696');

insert into UserLogin (UserID, PasswordHash, NRIC)
	values
	('john123', '$2b$10$s/K3qL.J0FmV0tQuuKz3I.wuG6FX3S7smHcAoI2EQaDT4Uw5D.m/2', 'S1234567A'),
	('emily123', '$2b$10$I4O4MUecU..PpevIzEXdt.MBAdOjKNa48AFYfybyk2wSbCm7Onb2y', 'S7654321B'),
	('albert123', '$2b$10$bkCNS1GKKp6Plr0IQSittOd4J95LNzWqwQ7d7KZ9AgyuprW/qyLGy', 'S1122334C'),
	('ben123', '$2b$10$FHF8Yd2yNeluwZ0ujPHaGejM4FRgNZTuNPsuQ.r0u7qeLVdNpvSGq', 'S5566778D'),
	('crystal123', '$2b$10$/dORlIfZDR3ApQKXlwIyxeIkycPfoGMbljkjTI7em.h1mCAMfc8Wm', 'S1111111E');

insert into Account (AccNo, NRIC, Balance, AccType, UEN)
	values
	('123-4-567890','S1234567A', 9890.20, 'Standard', null),
	('098-7-654321','S7654321B', 19994.80, 'Standard', null),
	('111-2-333444','S1122334C', 150015, 'Business', '111222333N'),
	('555-6-777888','S5566778D', 50000, 'Business', '444555666M'),
	('111-1-111111', 'S1111111E', 3100, 'Savings', null);

insert into Transactions (TransRef, PayerAccNo, RecipientAccNo, Description, Amount, Status, TransDateTime)
	values
	('1234567890123456', '123-4-567890', '098-7-654321', 'Lunch', 9.80, 'completed', '2026-11-07T14:00:00'),
	('0987654321098765', '098-7-654321', '111-2-333444', null, 15.00, 'completed', '2026-11-07T19:00:00'),
	('1122334455667788', '123-4-567890', '111-1-111111', 'Weekly allowance', 100.00, 'completed', '2026-11-08T10:00:00')

insert into Faqs (question, answer, keywords)
	values
	(
		'How to transfer money?', 
		'You may transfer money using the app by following these steps:

1. Tap on "Pay & Transfer" in the menu.
2. Select transfer type (Local or PayNow via mobile number, NRIC/FIN, or UEN).
3. Choose the recipient or add a new payee by entering their bank account or PayNow details.
4. Enter the transfer amount and any required payment details or notes.
5. Review the transaction details and slide to transfer (authenticate with OTP if prompted).

You may turn on money transfer guide mode if you need step-by-step guidance. Would you like me to show you how to turn on money transfer guide mode for extra help?', 
		'transfer, send money, pay, paynow, funds, fund, How do I transfer money to someone?, Can I send funds to another account?, Where is the button to send money?, How to make a PayNow transfer?, I want to pay a friend, how do I do that?'
	),
	(
		'How to reset my PIN?',
		'You can reset your OCBC card PIN by following the steps below:

1. Tap on the "More" icon in the bottom navigation bar and select "Card Services".
2. Tap on "Reset card PIN".
3. Select the existing card you want to reset the PIN for.
4. Enter your new 6-digit PIN and confirm it.
5. Enter the OTP sent to your SMS to complete the process.', 
		'reset PIN, card PIN, change PIN, change card PIN, debit card PIN, credit card PIN, card password, I forgot my card PIN, how do I change it?, How can I set a new PIN for my debit card?, How do I reset my card PIN?'
	),
	(
		'What is a UEN?',
		'A UEN (Unique Entity Number) is the standard identification number issued to businesses, companies, and organizations in Singapore. You will need a UEN when making corporate PayNow transfers to merchants, companies, or institutions via the app.',
		'UEN, Unique Entity Number, what is UEN, business UEN, company UEN, corporate paynow, business paynow, what does UEN stand for'
	),
	(
		'How to change language settings?',
		'You can change your preferred language in the app by following these steps:

1. Tap on "More" in the bottom navigation bar.
2. Open "Profile and app settings".
3. Tap on "Change language".
4. Select your preferred language.
5. Tap on "Confirm Language" to save your choice.

Your app display and menus will update right away, let me know if you need help finding any other settings!',
		'change language, language settings, app language, switch language, set language, language preference, how do I change the language?, can I use another language?, where is language setting, bahasa, chinese, malay, tamil'
	);

-- Insert sample saved contacts
INSERT INTO dbo.SavedContacts
    (OwnerNRIC, RecipientType, RecipientIdentifier, SavedName)
VALUES
    ('S1234567A', 'NRIC', 'S7654321B', 'Emily'),
    ('S1234567A', 'NRIC', 'S1111111E', 'Crystal'),
    ('S1234567A', 'NRIC', 'S1122334C', 'Albert'),

    ('S7654321B', 'NRIC', 'S1234567A', 'John'),
    ('S7654321B', 'NRIC', 'S1111111E', 'Crystal'),
    ('S7654321B', 'UEN', '444555666M', 'Ben'),

    ('S1122334C', 'NRIC', 'S1234567A', 'John'),
    ('S1122334C', 'NRIC', 'S7654321B', 'Emily'),

    ('S5566778D', 'UEN', '111222333N', 'Albert'),
    ('S5566778D', 'NRIC', 'S1111111E', 'Crystal'),

    ('S1111111E', 'NRIC', 'S7654321B', 'Emily'),
    ('S1111111E', 'NRIC', 'S1234567A', 'John');
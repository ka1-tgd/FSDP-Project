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
go

-- Insert sample data
insert into Users (NRIC, Name, PhoneNo)
	values
	('S1234567A', 'John Tan', '12345678'),
	('S7654321B', 'Emily Koh', '87654321'),
	('S1122334C', 'Albert Parke', '11223344'),
	('S5566778D', 'Ben Ng', '55667788'),
	('S1111111E', 'Crystal Lim', '96969696');

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
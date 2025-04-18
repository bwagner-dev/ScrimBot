USE LoL;

CREATE TABLE Users (
    UserID varchar(255) NOT NULL,
    PrimaryRole varchar(255) NOT NULL,
    SecondaryRole varchar(255) NOT NULL,
    TertiaryRole varchar(255) NOT NULL,
    PRIMARY KEY (UserID)
);

INSERT INTO Users
(UserID, PrimaryRole, SecondaryRole, TertiaryRole)
VALUES
(2, "ADC", "Mid", "Jungle");

SELECT * FROM Users;
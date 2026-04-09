-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS portfolio;

-- Create the user if it doesn't exist (replace 'your_password' with a real one)
CREATE USER IF NOT EXISTS 'portfolio_user'@'%' IDENTIFIED BY '1qZIA_plus_MYSQL_MY_USER';

-- Grant the privileges
GRANT ALL PRIVILEGES ON portfolio.* TO 'portfolio_user'@'%';

-- Apply the changes
FLUSH PRIVILEGES;

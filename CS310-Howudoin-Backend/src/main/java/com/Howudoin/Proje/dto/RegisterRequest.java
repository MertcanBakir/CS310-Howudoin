package com.Howudoin.Proje.dto;

public class RegisterRequest {
    private String name; // The user's first name.
    private String lastName; // The user's last name.
    private String email; // The user's email address.
    private String password; // The user's password.

    // Getter and setter for the 'name' field
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Getter and setter for the 'lastName' field
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    // Getter and setter for the 'email' field
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Getter and setter for the 'password' field
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
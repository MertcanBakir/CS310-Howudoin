package com.Howudoin.Proje.dto;

public class LoginRequest {
    private String email; // The user's email address.
    private String password; // The user's password.

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
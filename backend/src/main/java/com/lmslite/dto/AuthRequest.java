package com.lmslite.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {

    @NotBlank(message = "Username, Email, or Student ID is required")
    private String credential;

    @NotBlank(message = "Password is required")
    private String password;

    public AuthRequest() {}

    public AuthRequest(String credential, String password) {
        this.credential = credential;
        this.password = password;
    }

    public String getCredential() { return credential; }
    public void setCredential(String credential) { this.credential = credential; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

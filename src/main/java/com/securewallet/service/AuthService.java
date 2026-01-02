package com.securewallet.service;

import com.securewallet.dto.request.LoginRequest;
import com.securewallet.dto.request.RefreshTokenRequest;
import com.securewallet.dto.request.RegisterRequest;
import com.securewallet.dto.response.AuthResponse;
import com.securewallet.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String token);
}

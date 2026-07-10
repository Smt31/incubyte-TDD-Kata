package com.cardealership.service;

import com.cardealership.dto.RegisterRequest;
import com.cardealership.dto.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
}

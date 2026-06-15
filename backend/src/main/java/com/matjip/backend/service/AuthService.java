package com.matjip.backend.service;

import com.matjip.backend.domain.User;
import com.matjip.backend.dto.AuthResponse;
import com.matjip.backend.dto.LoginRequest;
import com.matjip.backend.dto.SignupRequest;
import com.matjip.backend.repository.UserRepository;
import com.matjip.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        User user = new User(req.getEmail(), passwordEncoder.encode(req.getPassword()), req.getNickname());
        userRepository.save(user);
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user.getNickname());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user.getNickname());
    }
}

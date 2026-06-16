package com.matjip.backend.controller;

import com.matjip.backend.dto.UpdateNicknameRequest;
import com.matjip.backend.dto.UpdatePasswordRequest;
import com.matjip.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PutMapping("/me/nickname")
    public ResponseEntity<Map<String, String>> updateNickname(
            @Valid @RequestBody UpdateNicknameRequest req,
            @AuthenticationPrincipal UserDetails user) {
        String updated = userService.updateNickname(user.getUsername(), req.getNickname());
        return ResponseEntity.ok(Map.of("nickname", updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest req,
            @AuthenticationPrincipal UserDetails user) {
        userService.updatePassword(user.getUsername(), req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok().build();
    }
}

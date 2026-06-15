package com.matjip.backend.controller;

import com.matjip.backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @PostMapping("/{id}/likes")
    public ResponseEntity<Map<String, Object>> toggle(@PathVariable Long id,
                                                       @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(likeService.toggle(id, user.getUsername()));
    }
}

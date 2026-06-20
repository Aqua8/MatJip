package com.matjip.backend.controller;

import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BookmarkController {
    private final BookmarkService bookmarkService;

    @GetMapping("/api/bookmarks")
    public ResponseEntity<List<RestaurantResponse>> list(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(bookmarkService.getBookmarks(user.getUsername()));
    }

    @PostMapping("/api/restaurants/{id}/bookmarks")
    public ResponseEntity<Map<String, Boolean>> toggle(@PathVariable Long id,
                                                        @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(bookmarkService.toggle(id, user.getUsername()));
    }
}

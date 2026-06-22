package com.matjip.backend.controller;

import com.matjip.backend.dto.RestaurantRequest;
import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> list(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(restaurantService.search(keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> get(@PathVariable Long id,
                                                   @AuthenticationPrincipal UserDetails user) {
        String email = user != null ? user.getUsername() : null;
        return ResponseEntity.ok(restaurantService.getById(id, email));
    }

    @GetMapping("/by-kakao/{kakaoPlaceId}")
    public ResponseEntity<RestaurantResponse> getByKakao(@PathVariable String kakaoPlaceId) {
        return restaurantService.findByKakaoPlaceId(kakaoPlaceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RestaurantResponse> register(@Valid @RequestBody RestaurantRequest req) {
        return ResponseEntity.ok(restaurantService.register(req));
    }
}

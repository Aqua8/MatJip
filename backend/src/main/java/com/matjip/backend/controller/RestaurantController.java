package com.matjip.backend.controller;

import com.matjip.backend.dto.RestaurantRequest;
import com.matjip.backend.dto.RestaurantResponse;
import com.matjip.backend.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<RestaurantResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RestaurantResponse> register(@Valid @RequestBody RestaurantRequest req) {
        return ResponseEntity.ok(restaurantService.register(req));
    }
}

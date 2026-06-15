package com.matjip.backend.service;

import com.matjip.backend.domain.*;
import com.matjip.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> toggle(Long restaurantId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("맛집을 찾을 수 없습니다."));
        Optional<Like> existing = likeRepository.findByUserIdAndRestaurantId(user.getId(), restaurantId);
        boolean liked;
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            liked = false;
        } else {
            likeRepository.save(new Like(user, restaurant));
            liked = true;
        }
        return Map.of("liked", liked, "count", likeRepository.countByRestaurantId(restaurantId));
    }
}

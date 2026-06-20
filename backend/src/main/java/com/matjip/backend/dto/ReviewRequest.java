package com.matjip.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import java.util.List;

@Getter
public class ReviewRequest {
    @NotNull @Min(1) @Max(5)
    private Byte rating;
    @NotBlank
    private String content;
    private List<String> imageUrls;
}

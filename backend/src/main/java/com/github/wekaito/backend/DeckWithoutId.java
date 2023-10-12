package com.github.wekaito.backend;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.lang.annotation.*;
import java.util.List;

public record DeckWithoutId(
        @NotNull
        String name,
        @NotNull
        String color,
        @NotNull
        @Size(min = 50, max = 55)
        @ValidDecklist
        List<String> decklist) {
}

@Documented
@Constraint(validatedBy = DecklistValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@interface ValidDecklist {
        String message() default "There was an error while saving the deck.";

        Class<?>[] groups() default {};

        Class<? extends Payload>[] payload() default {};
}

class DecklistValidator implements ConstraintValidator<ValidDecklist, List<String>> {
        @Override
        public boolean isValid(List<String> decklist, ConstraintValidatorContext context) {
                if (decklist == null) {
                        return false;
                }
                for (String card : decklist) {
                        if (card == null || "undefined".equals(card)) {
                                return false;
                        }
                }
                return true;
        }
}

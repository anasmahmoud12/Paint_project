package com.example.Painting.Entities;

import com.example.Painting.Cloning.Clone;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@DiscriminatorValue(value = "Rect")
@SuperBuilder

public class Rectangle extends Shape {

    double x;
    double y;
    double width;
    double height;
    @Override
    public Shape clone() {
        Rectangle cloned= Clone.makeClone(this,Rectangle.class);
        return cloned;
    }
    @Override
    public Shape clone2() {
        Rectangle cloned= Clone.makeClone(this,Rectangle.class);
        cloned.setX(this.getX()+50);
        cloned.setY(this.getY()+50);
        return cloned;
    }
}

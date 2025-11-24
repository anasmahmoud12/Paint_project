package com.example.Painting.Entities;

import com.example.Painting.Cloning.Clone;
import com.fasterxml.jackson.annotation.JsonTypeName;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@SuperBuilder

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
//@JsonTypeName("Circle")

@DiscriminatorValue(value = "Circle")
public class Circle  extends Shape {
    double centerX;
    double centerY;
    double radiusX;
    double radiusY;
    @Override
    public Shape clone() {
        Circle clonedCircle= Clone.makeClone(this,Circle.class);
        return clonedCircle;
    }
    @Override
    public Shape clone2() {
        Circle clonedCircle= Clone.makeClone(this,Circle.class);
        clonedCircle.setCenterX(this.centerX+50);
        clonedCircle.setCenterY(this.centerY+50);
        return clonedCircle;
    }
}

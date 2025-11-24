package com.example.Painting.Factory;

import com.example.Painting.Dto.ShapeDto;
import com.example.Painting.Entities.*;
import org.springframework.stereotype.Service;

@Service
public class FactoryOfShapes {

  public static Shape createShape(ShapeDto dto){
      String type =dto.getType();
      if(type.equals("Rect")){

return Rectangle.builder()
        .type("Rect")
        .strokeColor(dto.getStrokeColor())
        .fillColor(dto.getFillColor())
        .strokeWidth(dto.getStrokeWidth())
        .rotation(dto.getRotation())
        .x(dto.getX())
        .y(dto.getY())
        .width(dto.getWidth())
        .height(dto.getHeight())
        .build();


     }

      else if(type.equals("Square")){
          return Square.builder()
                  .type("Square")
                  .strokeColor(dto.getStrokeColor())
                  .fillColor(dto.getFillColor())
                  .strokeWidth(dto.getStrokeWidth())
                  .rotation(dto.getRotation())
                  .x(dto.getX())
                  .y(dto.getY())
                  .width(dto.getWidth())
                  .height(dto.getHeight())
                  .build();

      }

else if(type.equals("Circle")){
    return Circle.builder()
            .type("Circle")
            .strokeColor(dto.getStrokeColor())
            .fillColor(dto.getFillColor())
            .strokeWidth(dto.getStrokeWidth())
            .rotation(dto.getRotation())
            .centerX(dto.getCenterX())
            .centerY(dto.getCenterY())
            .radiusX(dto.getRadiusX())
            .radiusY(dto.getRadiusY())
            .build();


      }

else if(type.equals("Ellipse")){
    return Ellipse.builder()
            .type("Ellipse")
    .strokeColor(dto.getStrokeColor())
                  .fillColor(dto.getFillColor())
                  .strokeWidth(dto.getStrokeWidth())
                  .rotation(dto.getRotation())
            .centerX(dto.getCenterX())
            .centerY(dto.getCenterY())
            .radiusX(dto.getRadiusX())
            .radiusY(dto.getRadiusY())
            .build();
      }

else if(type.equals("Line")){
    return Line.builder()
            .type("Line")
            .strokeColor(dto.getStrokeColor())
            .fillColor(dto.getFillColor())
            .strokeWidth(dto.getStrokeWidth())
            .rotation(dto.getRotation())
            .points(dto.getPoints())
            .build();
      }

else if(type.equals("Triangle")){
    return  Triangle.builder()
            .type("Triangle")
            .strokeColor(dto.getStrokeColor())
            .fillColor(dto.getFillColor())
            .strokeWidth(dto.getStrokeWidth())
            .rotation(dto.getRotation())
            .points(dto.getPoints())
            .closed(true)
            .build();
      }

else {
    throw  new RuntimeException("unknown Shape");
      }

  }






}

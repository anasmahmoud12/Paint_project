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
            .strokeColor(dto.getStrokeColor())
            .fillColor(dto.getFillColor())
            .strokeWidth(dto.getStrokeWidth())
            .rotation(dto.getRotation())
            .centerX(dto.getCenterX())
            .centerY(dto.getCenterY())
            .radius(dto.getRadius())
            .build();


      }

else if(type.equals("Ellipse")){
    return Ellipse.builder()
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
            .strokeColor(dto.getStrokeColor())
            .fillColor(dto.getFillColor())
            .strokeWidth(dto.getStrokeWidth())
            .rotation(dto.getRotation())
            .points(dto.getPoints())
            .build();
      }

else if(type.equals("Triangle")){
    return  Triangle.builder()
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

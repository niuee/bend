import { PointCal } from "point2point";
import {Point} from "../bCurve";


export class Line {
    private startPoint: Point;
    private endPoint: Point;

    constructor(startPoint: Point, endPoint: Point){
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    getStartPoint(): Point{
        return this.startPoint;
    }

    getEndPoint(): Point{
        return this.endPoint;
    }

    intersectionWithAnotherLine(lineToIntersect: Line){
        return getLineIntersection(this.startPoint, this.endPoint, lineToIntersect.getStartPoint(), lineToIntersect.getEndPoint());
    }

    projectPoint(point: Point){
        return projectPointOntoLine(point, this.getStartPoint(), this.getEndPoint());
    }
    
    getTranslationRotationToAlginXAxis(){
        const translation = PointCal.subVector({x: 0, y: 0}, this.startPoint);
        const rotationAngle = PointCal.angleFromA2B(PointCal.subVector(this.endPoint, this.startPoint), {x: 1, y: 0});

        return {translation, rotationAngle};
    }
}

export function getLineIntersection(startPoint: Point, endPoint: Point, startPoint2: Point, endPoint2: Point):{
    intersects: boolean,
    intersection?: Point,
    offset?: number
}{
    const numerator = (endPoint2.x - startPoint2.x) * (startPoint.y - startPoint2.y) - (endPoint2.y - startPoint2.y) * (startPoint.x - startPoint2.x);
    const denominator = (endPoint2.y - startPoint2.y) * (endPoint.x - startPoint.x) - (endPoint2.x - startPoint2.x) * (endPoint.y - startPoint.y);
    
    if (denominator === 0){
        return {intersects: false};
    }
    const t = numerator / denominator;
    if (t >= 0 && t <= 1){
        return {
            intersects: true, 
            intersection: PointCal.linearInterpolation(startPoint, endPoint, t),
            offset: t
        }
    } else {
        return {
            intersects: false,
        }
    }

}

export function projectPointOntoLine(point: Point, lineStartPoint: Point, lineEndPoint: Point): {
    within: boolean,
    projectionPoint?: Point,
    offset?: number
}{
    const baseVector = PointCal.unitVector(PointCal.subVector(lineEndPoint, lineStartPoint));
    const vectorToPoint = PointCal.subVector(point, lineStartPoint);
    const res = PointCal.dotProduct(vectorToPoint, baseVector);
    if (res < 0 || res > PointCal.magnitude(PointCal.subVector(lineEndPoint, lineStartPoint))){
        return {
            within: false,
        };
    }
    return {
        within: true,
        projectionPoint: PointCal.addVector(lineStartPoint, PointCal.multiplyVectorByScalar(baseVector, res)),
        offset: res / PointCal.magnitude(PointCal.subVector(lineEndPoint, lineStartPoint))
    };

}

export function pointInPolygon(polygonVertices: Point[], interestedPoint: Point){
    let angleCheck = polygonVertices.map((point, index, array)=>{
        let endPoint: Point;
        if (index == polygonVertices.length - 1) {
            // last one need to wrap to the first point
            endPoint = array[0];
        }else {
            endPoint = array[index + 1];
        }
        let baseVector = PointCal.subVector(endPoint, point);
        let checkVector = PointCal.subVector(interestedPoint, point);
        return PointCal.angleFromA2B(baseVector, checkVector);
    });
    let outOfPolygon = angleCheck.filter((angle)=>{
        return angle > 0;
    }).length > 0;

    return !outOfPolygon;
}
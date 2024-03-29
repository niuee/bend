import { Bezier } from "bezier-js";
import { PointCal } from "point2point";
import { bCurve, Point, TValOutofBoundError } from "../../src/bCurve";
import { Line } from "../../src/line";





describe("Basic Operation on Bezier Curve", ()=>{

    test("Initializing bezier curve with 3 control points", ()=>{
        const controlPoints = [{x: 10, y: 20}, {x: 30, y: 50}, {x:20 ,y: 30}];
        const testBCurve = new bCurve(controlPoints);
        expect(testBCurve.getControlPoints().sort()).toEqual(controlPoints.sort());
    });

    test("Initializing bezier curve with 4 control points", ()=>{
        const controlPoints = [{x: 10, y: 20}, {x: 30, y: 50}, {x:20 ,y: 30}, {x: 70, y: 30}];
        const testBCurve = new bCurve(controlPoints);
        expect(testBCurve.getControlPoints().sort()).toEqual(controlPoints.sort());
    });

    describe("Quadratic Bezier Curve (3 Control Points)", ()=>{
        const controlPoints: Point[] = [];
        let testBCurve: bCurve;
        let refBCurve: Bezier;

        beforeEach(() => {
            controlPoints.length =  0;
            for(let index = 0; index < 3; index++){
                controlPoints.push({x: getRandom(-500, 500), y: getRandom(-500, 500)});
            }
            testBCurve = new bCurve(controlPoints);
            refBCurve = new Bezier(controlPoints);
        });

        test("Get point coordinate given a value t using compute (a more general method)", ()=>{
            const tVal = Math.random();
            const expectedRes = refBCurve.get(tVal);
            const expectX = expectedRes.x;
            const expectY = expectedRes.y;
            const testRes = testBCurve.get(tVal);
            expect(testRes.x).toBeCloseTo(expectX, 5);
            expect(testRes.y).toBeCloseTo(expectY, 5);
        });

        test("Get point coordinate given a value t using get (tailored specific to the type of bezier curve)", ()=>{
            const tVal = Math.random();
            const expectedRes = refBCurve.get(tVal);
            const expectX = expectedRes.x;
            const expectY = expectedRes.y;
            const testRes = testBCurve.get(tVal);
            expect(testRes.x).toBeCloseTo(expectX, 5);
            expect(testRes.y).toBeCloseTo(expectY, 5);
        });

        test("Invalid t Value (gt 1 or lt 0)", ()=>{
            const testResGt1 = ()=>{
                testBCurve.get(1.1);
            }
            const testResLt0 = ()=>{
                testBCurve.get(-0.1);
            }
            expect(testResGt1).toThrow(TValOutofBoundError);
            expect(testResLt0).toThrow(TValOutofBoundError);
        });

        test("Get Derivative at given t value unnormalized", ()=>{
            const tVal = Math.random();
            const expectRes = refBCurve.derivative(tVal);
            const testRes = testBCurve.derivative(tVal);
            expect(testRes.x).toBeCloseTo(expectRes.x);
            expect(testRes.y).toBeCloseTo(expectRes.y);
        });

        test("Get Derivative at given t value normalized", ()=>{
            const tVal = Math.random();
            const derivativeUnNormalized = refBCurve.derivative(tVal);
            const derivativeNormalized = PointCal.unitVector({x: derivativeUnNormalized.x, y: derivativeUnNormalized.y});
            const testRes = testBCurve.derivativeNormalized(tVal);
            expect(testRes.x).toBeCloseTo(derivativeNormalized.x);
            expect(testRes.y).toBeCloseTo(derivativeNormalized.y);
        });

        test("Get arc length", ()=>{
            const expectRes = refBCurve.length();
            const testRes = testBCurve.fullLength();
            expect(testRes).toBeCloseTo(expectRes);
        });

        test("Split curve in half at given t value", ()=>{
            const tVal = Math.random();
            const expectRes = refBCurve.split(tVal);
            const testRes = testBCurve.split(tVal);
            const expectLeftHalf = expectRes.left.points;
            const expectRightHalf = expectRes.right.points;
            const testLeft = testRes[0];
            const testRight = testRes[1];
            testLeft.forEach((point, index)=>{
                expect(point.x).toBeCloseTo(expectLeftHalf[index].x);
                expect(point.y).toBeCloseTo(expectLeftHalf[index].y);
            });
            testRight.forEach((point, index)=>{
                expect(point.x).toBeCloseTo(expectRightHalf[index].x);
                expect(point.y).toBeCloseTo(expectRightHalf[index].y);
            });
        });

        test("Set control point at given index i", ()=>{
            const newPoint = {x: getRandom(-500, 500), y: getRandom(-500, 500)};
            const index = getRandomInt(0, 2);
            testBCurve.setControlPointAtIndex(index, newPoint);
            refBCurve.points[index] = newPoint;
            expect(testBCurve.getControlPoints()).toEqual(refBCurve.points);
        });

        test("Set control point with an invalid index", ()=>{
            const newPoint = {x: getRandom(-500, 500), y: getRandom(-500, 500)};
            const gtRes = testBCurve.setControlPointAtIndex(4, newPoint);
            const ltRes = testBCurve.setControlPointAtIndex(-3, newPoint);
            expect(gtRes).toBe(false);
            expect(ltRes).toBe(false);
        });

        test("3 x 3 Matrix Determinant", ()=>{
            let matrix = [[7, -4, 2], [3, 1, -5], [2, 2, -5]];
            const testRes = testBCurve.determinant3by3(matrix);
            expect(testRes).toBe(23);
            matrix = [[1, -6, -7], [1, -4, 7], [-1, -3, -6]];
            expect(testBCurve.determinant3by3(matrix)).toBe(100);
        });

        test("Fit Arc Given 3 points", ()=>{
            const startPoint = {x: 1, y: 1};
            const midPoint = {x: 2, y: 4};
            const endPoint = {x: 5, y: 3};
            const testRes = testBCurve.fitArc(startPoint, endPoint, midPoint);
            expect(testRes.exists).toBe(true);
            expect(testRes.center?.x).toBeCloseTo(3);
            expect(testRes.center?.y).toBeCloseTo(2);
            expect(testRes.radius).toBeCloseTo(Math.sqrt(5));
        });

        test("Fit Arc Given 3 points lying on a line", ()=>{
            const startPoint = {x: 3, y: 0};
            const midPoint = {x: 2, y: 0};
            const endPoint = {x: 5, y: 0};
            const testRes = testBCurve.fitArc(startPoint, endPoint, midPoint);
            expect(testRes.exists).toBe(false);
        });

        test("Find arcs in bezier curve", ()=>{
            const errorThreshold = 0.5;
            const testRes = testBCurve.findArcs(errorThreshold);
            const inflectedCurve = new bCurve([{x: 52, y: 235}, {x: 56, y:118}, {x: 204, y:222}, {x: 179, y: 107}]);
            const inflectedRes = inflectedCurve.findArcs(errorThreshold);

            let prevT = 0;
            testRes.forEach((arc)=>{
                expect(arc.startT).toBe(prevT);
                prevT = arc.endT;
                for(let tVal=arc.startT; tVal <= arc.endT; tVal+= 0.01){
                    const testPoint = testBCurve.get(tVal);
                    const testRadius = PointCal.distanceBetweenPoints(testPoint, arc.center);
                    let proximityRes = false;
                    if (Math.abs(testRadius - arc.radius) < errorThreshold || Math.abs(Math.abs(testRadius - arc.radius) - errorThreshold) < errorThreshold * 0.5){
                        proximityRes = true;
                    }
                    expect(proximityRes).toBe(true);
                }
            });
            expect(prevT).toBe(1);
            prevT = 0;
            inflectedRes.forEach((arc)=>{
                expect(arc.startT).toBe(prevT);
                prevT = arc.endT;
                for(let tVal=arc.startT; tVal <= arc.endT; tVal+= 0.01){
                    const testPoint = inflectedCurve.get(tVal);
                    const testRadius = PointCal.distanceBetweenPoints(testPoint, arc.center);
                    let proximityRes = false;
                    if (Math.abs(testRadius - arc.radius) < errorThreshold || Math.abs(Math.abs(testRadius - arc.radius) - errorThreshold) < errorThreshold * 0.5){
                        proximityRes = true;
                    }
                    expect(proximityRes).toBe(true);
                }
            });
            expect(prevT).toBe(1);
        });

        test("Find arcs with a straight bezier curve", ()=>{
            const controlPoint1 = {x: 100, y: 0};
            const controlPoint2 = {x: 200, y: 0};
            const controlPoint3 = {x: 300, y: 0};
            const controlPoint4 = {x: 400, y: 0};
            const straightCurve = new bCurve([controlPoint1, controlPoint2, controlPoint3, controlPoint4]);
            const testRes = straightCurve.findArcs(0.01);
            expect(testRes.length).toBe(0);
        });

        // test("Get Curvature at a given t", ()=>{
        //     for(let tVal = 0; tVal <= 1; tVal += 0.01){
        //         const testRes = testBCurve.curvature(tVal);
        //         const expectRes = refBCurve.curvature(tVal);
        //         expect(testRes).toBeCloseTo(expectRes.k);
        //     }
        // });

        test("Get Coefficients of different order of t from the bezier curve", ()=>{
            const testRes = testBCurve.getCoefficientOfTTerms();
            const controlPoints = testBCurve.getControlPoints();
            const constantTerm = PointCal.multiplyVectorByScalar(controlPoints[0], 1);
            const firstOrderTerm = PointCal.addVector(PointCal.multiplyVectorByScalar(controlPoints[0],-2), PointCal.multiplyVectorByScalar(controlPoints[1],2));
            const secondOrderTerm = PointCal.addVector(controlPoints[0], PointCal.addVector(PointCal.multiplyVectorByScalar(controlPoints[1],-2), controlPoints[2]));
            expect(testRes.length).toBe(3);
            expect(testRes[0].x).toBeCloseTo(constantTerm.x);
            expect(testRes[0].y).toBeCloseTo(constantTerm.y);
            expect(testRes[1].x).toBeCloseTo(firstOrderTerm.x);
            expect(testRes[1].y).toBeCloseTo(firstOrderTerm.y);
            expect(testRes[2].x).toBeCloseTo(secondOrderTerm.x);
            expect(testRes[2].y).toBeCloseTo(secondOrderTerm.y);
        });

        test("Get Coefficients of different order of t from the derivative of the bezier curve", ()=>{
            const testRes = testBCurve.getDerivativeCoefficients();
            const derivativeControlPoints = testBCurve.getDerivativeControlPoints(testBCurve.getControlPoints());
            const constantTerm = PointCal.multiplyVectorByScalar(derivativeControlPoints[0], 1);
            const firstOrderTerm = PointCal.addVector(PointCal.multiplyVectorByScalar(derivativeControlPoints[0],-1), PointCal.multiplyVectorByScalar(derivativeControlPoints[1], 1));
            expect(testRes.length).toBe(2);
            expect(testRes[0].x).toBeCloseTo(constantTerm.x);
            expect(testRes[0].y).toBeCloseTo(constantTerm.y);
            expect(testRes[1].x).toBeCloseTo(firstOrderTerm.x);
            expect(testRes[1].y).toBeCloseTo(firstOrderTerm.y);
        });

        test("Solve Cubic Polynomial", ()=>{
            const a = getRandom(-500, 500);
            const b = getRandom(-500, 500);
            const c = getRandom(-500, 500);
            const d = getRandom(-500, 500);
            const testRes = testBCurve.solveCubic(a, b, c, d);
            const refRes = solveCubic(a, b, c, d);
            expect(testRes).toEqual(refRes);
        });

        test("Find Extrema in Bezier Curve", ()=>{
            const testRes = testBCurve.getExtrema();
            const expectRes = refBCurve.extrema();
            expect(testRes.x.length).toBe(expectRes.x.length);
            expect(testRes.y.length).toBe(expectRes.y.length);
            testRes.x.sort();
            testRes.y.sort();
            expectRes.x.sort().forEach((x, index)=>{
                expect(testRes.x[index]).toBeCloseTo(x);
            });
            expectRes.y.sort().forEach((y, index)=>{
                expect(testRes.y[index]).toBeCloseTo(y);
            });
        });

        test("Find Axis Aligned Bounding Box of the bezier curve", ()=>{
            const boundingBox = testBCurve.getAABB();
            const refBoundingBox = refBCurve.bbox();
            expect(boundingBox.min.x).toBeCloseTo(refBoundingBox.x.min);
            expect(boundingBox.min.y).toBeCloseTo(refBoundingBox.y.min);
            expect(boundingBox.max.x).toBeCloseTo(refBoundingBox.x.max);
            expect(boundingBox.max.y).toBeCloseTo(refBoundingBox.y.max);
        });

        test("Align Bezier Curve with the X axis", ()=>{
            const testControlPoints = [{x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}];
            const alignRefBCurve = new bCurve(testControlPoints);
            const testRes = alignRefBCurve.getControlPointsAlignedWithXAxis();
            expect(testRes.length).toBe(3);
            expect(testRes[testRes.length - 1].y).toBeCloseTo(0);
            const alignTestBCurve = new bCurve(testRes);
            for(let tVal = 0; tVal <= 1; tVal += 0.01){
                const refPosition = alignRefBCurve.compute(tVal);
                const testPosition = alignTestBCurve.compute(tVal);
                const refDist = PointCal.distanceBetweenPoints(alignRefBCurve.getControlPoints()[0], refPosition);
                const testDist = PointCal.distanceBetweenPoints(alignTestBCurve.getControlPoints()[0], testPosition);
                expect(testDist).toBeCloseTo(refDist);
            }
        });

        test("Find Intersection(s) between a line and a bezier curve", ()=>{
            const line = new Line({x: 15, y: 250}, {x: 220, y: 20});
            const testCurve = new bCurve([{x: 70, y: 250}, {x: 20, y: 110}, {x: 220, y: 60}]);
            const testRes = testCurve.getLineIntersections(line);
            expect(testRes.length).toBe(2);
            testRes.sort();
            const refRes = [0.19, 0.87];
            testRes.forEach((tVal, index)=>{
                expect(tVal).toBeCloseTo(refRes[index]);
            });
        });

        test("Find Intersection(s) between a line and a bezier curve when intersection is not within the line segment", ()=>{
            const line = new Line({x: 15, y: 250}, {x: 220, y: 20});
            const lineUnitVector = PointCal.unitVectorFromA2B(line.getStartPoint(), line.getEndPoint());
            const unitLine = new Line(line.getStartPoint(), PointCal.addVector(line.getStartPoint(), lineUnitVector));
            const testCurve = new bCurve([{x: 70, y: 250}, {x: 20, y: 110}, {x: 220, y: 60}]);
            const testRes = testCurve.getLineIntersections(unitLine);
            expect(testRes.length).toBe(0);
        });

        test("Find Intersections with other bezier curve", ()=>{
            const controlPoints1 = [{x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500,500), y: getRandom(-500, 500)}];
            const controlPoints2 = [{x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}];
            const curve1 = new bCurve(controlPoints1);
            const curve2 = new bCurve(controlPoints2);
            const testRes = curve1.getCurveIntersections(curve2);
            testRes.forEach((intersection)=>{
                const testPoint1 = curve1.get(intersection.selfT);
                const testPoint2 = curve2.get(intersection.otherT);
                expect(testPoint1.x).toBeCloseTo(testPoint2.x);
                expect(testPoint1.y).toBeCloseTo(testPoint2.y);
            });
        });

        test("Get Look up table from the bezier curve", ()=>{
            const steps = getRandomInt(5, 100);
            const testRes = testBCurve.getLUT(steps);
            const expectRes = refBCurve.getLUT(steps);
            expect(testRes.length).toBe(expectRes.length);
            expectRes.forEach((point, index)=>{
                expect(testRes[index].x).toBeCloseTo(point.x);
                expect(testRes[index].y).toBeCloseTo(point.y);
            });
        });

        test("Project Points onto bezier curve", ()=>{
            const testControlPoints = [{x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}];
            const testCurve = new bCurve(testControlPoints);
            const testMousePosition = {x: getRandom(-500, 500), y: getRandom(-500, 500)};
            const testRes = testCurve.getProjection(testMousePosition);
            const LUT = testCurve.getLUT();
            LUT.forEach((point)=>{
                expect(PointCal.distanceBetweenPoints(testRes.projection, testMousePosition)).toBeLessThanOrEqual(PointCal.distanceBetweenPoints(point, testMousePosition));
            });
        });

        test("Find Intersections between a bezier curve with a circle", ()=>{
            const testControlPoints = getRandomQuadraticControlPoints(-500, 500);
            const testCurve = new bCurve(testControlPoints);
            const circleCenter = getRandomPoint(-500, 500);
            const radius = getRandom(-300, 300);
            const testRes = testCurve.getCircleIntersections(circleCenter, radius);
            testRes.forEach((intersection)=>{
                expect(PointCal.distanceBetweenPoints(intersection.intersection, circleCenter)).toBeCloseTo(radius);
            });
        });
    });

    describe("Cubic Bezier Curve (4 Control Points)", ()=>{
        const controlPoints: Point[] = [];
        let testBCurve: bCurve;
        let refBCurve: Bezier;
        beforeEach(() => {
            controlPoints.length =  0;
            for(let index = 0; index < 4; index++){
                controlPoints.push({x: getRandom(-500, 500), y: getRandom(-500, 500)});
            }
            testBCurve = new bCurve(controlPoints);
            refBCurve = new Bezier(controlPoints);
        });

        test("Get point coordinate given a value t using compute (a more general method)", ()=>{
            const tVal = 0;
            const expectedRes = refBCurve.get(tVal);
            expect(testBCurve.compute(tVal)).toEqual({x: expectedRes.x, y: expectedRes.y});
        });

        test("Get point coordinate given a value t using get (tailored specific to the type of bezier curve)", ()=>{
            const tVal = Math.random();
            const expectedRes = refBCurve.get(tVal);
            const expectX = expectedRes.x;
            const expectY = expectedRes.y;
            const testRes = testBCurve.get(tVal);
            expect(testRes.x).toBeCloseTo(expectX, 5);
            expect(testRes.y).toBeCloseTo(expectY, 5);
        });

        test("Invalid t value (gt 1 or lt 0)", ()=>{
            const cTestResGt1 = ()=>{
                testBCurve.get(1.1);
            }
            const cTestResLt0 = ()=>{
                testBCurve.get(-0.1);
            }
            expect(cTestResGt1).toThrow(TValOutofBoundError);
            expect(cTestResLt0).toThrow(TValOutofBoundError);
        });

        test("Get Derivative at given t value unnormalized", ()=>{
            const tVal = Math.random();
            const expectRes = refBCurve.derivative(tVal);
            const testRes = testBCurve.derivative(tVal);
            expect(testRes.x).toBeCloseTo(expectRes.x);
            expect(testRes.y).toBeCloseTo(expectRes.y);
        });

        test("Get Derivative at given t value normalized", ()=>{
            const tVal = Math.random();
            const derivativeUnNormalized = refBCurve.derivative(tVal);
            const derivativeNormalized = PointCal.unitVector({x: derivativeUnNormalized.x, y: derivativeUnNormalized.y});
            const testRes = testBCurve.derivativeNormalized(tVal);
            expect(testRes.x).toBeCloseTo(derivativeNormalized.x);
            expect(testRes.y).toBeCloseTo(derivativeNormalized.y);
        });

        test("Get arc length", ()=>{
            const expectRes = refBCurve.length();
            const testRes = testBCurve.fullLength();
            expect(testRes).toBeCloseTo(expectRes);
        });

        test("Split curve in half at given t value", ()=>{
            const tVal = Math.random();
            const expectRes = refBCurve.split(tVal);
            const testRes = testBCurve.split(tVal);
            const expectLeftHalf = expectRes.left.points;
            const expectRightHalf = expectRes.right.points;
            const testLeft = testRes[0];
            const testRight = testRes[1];
            testLeft.forEach((point, index)=>{
                expect(point.x).toBeCloseTo(expectLeftHalf[index].x);
                expect(point.y).toBeCloseTo(expectLeftHalf[index].y);
            });
            testRight.forEach((point, index)=>{
                expect(point.x).toBeCloseTo(expectRightHalf[index].x);
                expect(point.y).toBeCloseTo(expectRightHalf[index].y);
            });
        });

        test("Set control point at given index i", ()=>{
            const newPoint = {x: getRandom(-500, 500), y: getRandom(-500, 500)};
            const index = getRandomInt(0, 3);
            testBCurve.setControlPointAtIndex(index, newPoint);
            refBCurve.points[index] = newPoint;
            expect(testBCurve.getControlPoints()).toEqual(refBCurve.points);
        });

        test("Set control point with an invalid index", ()=>{
            const newPoint = {x: getRandom(-500, 500), y: getRandom(-500, 500)};
            const gtRes = testBCurve.setControlPointAtIndex(4, newPoint);
            const ltRes = testBCurve.setControlPointAtIndex(-3, newPoint);
            expect(gtRes).toBe(false);
            expect(ltRes).toBe(false);
        });

        test("Find arcs in bezier curve", ()=>{
            const errorThreshold = 0.5;
            const testRes = testBCurve.findArcs(errorThreshold);
            let prevT = 0;
            testRes.forEach((arc)=>{
                expect(arc.startT).toBe(prevT);
                prevT = arc.endT;
                for(let tVal=arc.startT; tVal <= arc.endT; tVal+= 0.01){
                    const testPoint = testBCurve.get(tVal);
                    const testRadius = PointCal.distanceBetweenPoints(testPoint, arc.center);
                    let proximityRes = false;
                    if (Math.abs(testRadius - arc.radius) < errorThreshold || Math.abs(Math.abs(testRadius - arc.radius) - errorThreshold) < errorThreshold * 0.5){
                        proximityRes = true;
                }
                    expect(proximityRes).toBe(true);
                }
            });
            expect(prevT).toBe(1);
        });

        test("Find arcs with a straight bezier curve", ()=>{
            const controlPoint1 = {x: 100, y: 0};
            const controlPoint2 = {x: 200, y: 0};
            const controlPoint3 = {x: 300, y: 0};
            const straightCurve = new bCurve([controlPoint1, controlPoint2, controlPoint3]);
            const testRes = straightCurve.findArcs(0.01);
            expect(testRes.length).toBe(0);
        });

        // test("Get Curvature at a given t", ()=>{
        //     for(let tVal = 0; tVal <= 1; tVal += 0.01){
        //         const testRes = testBCurve.curvature(tVal);
        //         const expectRes = refBCurve.curvature(tVal);
        //         expect(testRes).toBeCloseTo(expectRes.k);
        //     }
        // });

        test("Get Coefficients of different order of t from the bezier curve", ()=>{
            const testRes = testBCurve.getCoefficientOfTTerms();
            const controlPoints = testBCurve.getControlPoints();
            const constantTerm = PointCal.multiplyVectorByScalar(controlPoints[0], 1);
            const firstOrderTerm = PointCal.addVector(PointCal.multiplyVectorByScalar(controlPoints[0],-3), PointCal.multiplyVectorByScalar(controlPoints[1],3));
            const secondOrderTerm = PointCal.addVector(PointCal.multiplyVectorByScalar(controlPoints[0], 3), PointCal.addVector(PointCal.multiplyVectorByScalar(controlPoints[1],-6), PointCal.multiplyVectorByScalar(controlPoints[2], 3)));
            const thirdOrderTerm = PointCal.addVector(PointCal.addVector(PointCal.multiplyVectorByScalar(controlPoints[0],-1), PointCal.multiplyVectorByScalar(controlPoints[1],3)), PointCal.addVector(PointCal.multiplyVectorByScalar(controlPoints[2],-3), PointCal.multiplyVectorByScalar(controlPoints[3],1)));

            expect(testRes.length).toBe(4);
            expect(testRes[0].x).toBeCloseTo(constantTerm.x);
            expect(testRes[0].y).toBeCloseTo(constantTerm.y);
            expect(testRes[1].x).toBeCloseTo(firstOrderTerm.x);
            expect(testRes[1].y).toBeCloseTo(firstOrderTerm.y);
            expect(testRes[2].x).toBeCloseTo(secondOrderTerm.x);
            expect(testRes[2].y).toBeCloseTo(secondOrderTerm.y);
            expect(testRes[3].x).toBeCloseTo(thirdOrderTerm.x);
            expect(testRes[3].y).toBeCloseTo(thirdOrderTerm.y);
        });

        test("Get Coefficients of different order of t from the derivative of the bezier curve", ()=>{
            const testRes = testBCurve.getDerivativeCoefficients();
            const derivativeControlPoints = testBCurve.getDerivativeControlPoints(testBCurve.getControlPoints());
            const constantTerm = PointCal.multiplyVectorByScalar(derivativeControlPoints[0], 1);
            const firstOrderTerm = PointCal.addVector(PointCal.multiplyVectorByScalar(derivativeControlPoints[0],-2), PointCal.multiplyVectorByScalar(derivativeControlPoints[1], 2));
            const secondOrderTerm = PointCal.addVector(PointCal.addVector(PointCal.multiplyVectorByScalar(derivativeControlPoints[0], 1), PointCal.multiplyVectorByScalar(derivativeControlPoints[1], -2)), PointCal.multiplyVectorByScalar(derivativeControlPoints[2],1));
            expect(testRes.length).toBe(3);
            expect(testRes[0].x).toBeCloseTo(constantTerm.x);
            expect(testRes[0].y).toBeCloseTo(constantTerm.y);
            expect(testRes[1].x).toBeCloseTo(firstOrderTerm.x);
            expect(testRes[1].y).toBeCloseTo(firstOrderTerm.y);
            expect(testRes[2].x).toBeCloseTo(secondOrderTerm.x);
            expect(testRes[2].y).toBeCloseTo(secondOrderTerm.y);
        });

        test("Align Bezier Curve with the X axis", ()=>{
            const testControlPoints = [{x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}, {x: getRandom(-500, 500), y: getRandom(-500, 500)}];
            const alignRefBCurve = new bCurve(testControlPoints);
            const testRes = alignRefBCurve.getControlPointsAlignedWithXAxis();
            expect(testRes.length).toBe(4);
            expect(testRes[testRes.length - 1].y).toBeCloseTo(0);
            const alignTestBCurve = new bCurve(testRes);
            for(let tVal = 0; tVal <= 1; tVal += 0.01){
                const refPosition = alignRefBCurve.compute(tVal);
                const testPosition = alignTestBCurve.compute(tVal);
                const refDist = PointCal.distanceBetweenPoints(alignRefBCurve.getControlPoints()[0], refPosition);
                const testDist = PointCal.distanceBetweenPoints(alignTestBCurve.getControlPoints()[0], testPosition);
                expect(testDist).toBeCloseTo(refDist);
            }
        });

        test("Find Extrema in Bezier Curve", ()=>{
            const testRes = testBCurve.getExtrema();
            const expectRes = refBCurve.extrema();
            expect(testRes.x.length).toBe(expectRes.x.length);
            expect(testRes.y.length).toBe(expectRes.y.length);
            testRes.x.sort();
            testRes.y.sort();
            expectRes.x.sort().forEach((x, index)=>{
                expect(testRes.x[index]).toBeCloseTo(x);
            });
            expectRes.y.sort().forEach((y, index)=>{
                expect(testRes.y[index]).toBeCloseTo(y);
            });
        });

        test("Find Intersection(s) between a line and a bezier curve", ()=>{
            const line = new Line({x: 25, y: 260}, {x: 240, y: 55});
            const testCurve = new bCurve([{x: 110, y: 150}, {x: 25, y: 190}, {x: 210, y: 250}, {x: 210, y: 30}]);
            const testRes = testCurve.getLineIntersections(line);
            expect(testRes.length).toBe(2);
            testRes.sort();
            const refRes = [0.36, 0.90];
            testRes.forEach((tVal, index)=>{
                expect(tVal).toBeCloseTo(refRes[index]);
            });
        });

        test("Find self intersections", ()=>{
            const controlPoints = [{x: 176, y: 135}, {x: 45, y:235}, {x: 220, y: 235}, {x: 98, y: 127}];
            const testCurve = new bCurve(controlPoints);
            const testRes = testCurve.getSelfIntersections();
            expect(testRes.length).toBe(1);
            testRes.forEach((intersection)=>{
                const testPoint1 = testCurve.get(intersection.selfT);
                const testPoint2 = testCurve.get(intersection.otherT);
                expect(testPoint1.x).toBeCloseTo(testPoint2.x);
                expect(testPoint1.y).toBeCloseTo(testPoint2.y);
            });
        });

        test("Get Look up table from the bezier curve", ()=>{
            const steps = getRandomInt(5, 100);
            const testRes = testBCurve.getLUT(steps);
            const expectRes = refBCurve.getLUT(steps);
            expect(testRes.length).toBe(expectRes.length);
            expectRes.forEach((point, index)=>{
                expect(testRes[index].x).toBeCloseTo(point.x);
                expect(testRes[index].y).toBeCloseTo(point.y);
            });
        });

        test("Project Points onto bezier curve", ()=>{
            const testControlPoints = getRandomCubicControlPoints(-500, 500);
            const testCurve = new bCurve(testControlPoints);
            const testMousePosition = getRandomPoint(-500, 500);
            const testRes = testCurve.getProjection(testMousePosition);
            const LUT = testCurve.getLUT();
            LUT.forEach((point)=>{
                expect(PointCal.distanceBetweenPoints(testRes.projection, testMousePosition)).toBeLessThanOrEqual(PointCal.distanceBetweenPoints(point, testMousePosition));
            });
        });

        test("Find Intersections between a bezier curve with a circle", ()=>{
            const testControlPoints = getRandomCubicControlPoints(-500, 500);
            const testCurve = new bCurve(testControlPoints);
            const circleCenter = getRandomPoint(-500, 500);
            const radius = getRandom(-300, 300);
            const testRes = testCurve.getCircleIntersections(circleCenter, radius);
            testRes.forEach((intersection)=>{
                expect(PointCal.distanceBetweenPoints(intersection.intersection, circleCenter)).toBeCloseTo(radius);
            });
        });

    })

});


function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandom(min: number, max: number){
    return Math.random() * (max - min) + min;
}

function getRandomPoint(min: number, max: number): Point{
    return {x: getRandom(min, max), y: getRandom(min, max)};
}

function getRandomQuadraticControlPoints(min: number, max: number): Point[]{
    return getRandomControlPoints(min, max, 3);
}

function getRandomCubicControlPoints(min: number, max: number): Point[]{
    return getRandomControlPoints(min, max, 4);
}

function getRandomControlPoints(min: number, max: number, num?: number): Point[]{
    if (num == undefined){
        num = 1;
    }
    const res: Point[] = [];
    for(let index = 0; index < num; index++){
        res.push({x: getRandom(min, max), y: getRandom(min, max)});
    }
    return res;
}

function cuberoot(x: number) {
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
}

function solveCubic(a: number, b: number, c: number, d: number) {
    if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
        a = b; b = c; c = d;
        if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
            a = b; b = c;
            if (Math.abs(a) < 1e-8) // Degenerate case
                return [];
            return [-b/a];
        }

        let D = b*b - 4*a*c;
        if (Math.abs(D) < 1e-8)
            return [-b/(2*a)];
        else if (D > 0)
            return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
        return [];
    }

    // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
    let p = (3*a*c - b*b)/(3*a*a);
    let q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
    let roots: number[];

    if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
        roots = [cuberoot(-q)];
    } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
        roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
    } else {
        let D = q*q/4 + p*p*p/27;
        if (Math.abs(D) < 1e-8) {       // D = 0 -> two roots
            roots = [-1.5*q/p, 3*q/p];
        } else if (D > 0) {             // Only one real root
            let u = cuberoot(-q/2 - Math.sqrt(D));
            let v = cuberoot(-q/2 + Math.sqrt(D));
            //console.log("Complext Root 1 real:", -(u+v)/2.0 - a / 3.0, "imaginary:", Math.sqrt(3) / 2.0 * (v - u));
            //console.log("Complext Root 2 real:", -(u+v)/2.0 - a / 3.0, "imaginary:",-1 * Math.sqrt(3) / 2.0 * (v - u));

            roots = [u - p/(3*u)];
        } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
            let u = 2*Math.sqrt(-p/3);
            let t = Math.acos(3*q/p/u)/3;  // D < 0 implies p < 0 and acos argument in [-1..1]
            let k = 2*Math.PI/3;
            roots = [u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k)];
        }
    }

    // Convert back from depressed cubic
    for (let i = 0; i < roots.length; i++)
        roots[i] -= b/(3*a);

    return roots;
}
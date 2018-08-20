let COLLISION_RESPONSE_SLIDE = 0;
let COLLISION_RESPONSE_DIE = 1;
let COLLISION_RESPONSE_BOUNCE = 2;
let COLLISION_RESPONSE_NONE = 0;

interface EntityBase {
    id: number;
    x: number;
    y: number;
    z: number;
    bounds(): Rect3;
    lineColor: Vector3;
    fillColor: Vector3;
    lineWidth: number;
    positionBuffer: WebGLBuffer;
    indicesBuffer: WebGLBuffer;
    indicesCount: number;
}

interface Monster extends EntityBase {
    isMonster: 1;
    radius: number;
    vx: number;
    vy: number;
    vz: number;
    rx: number;
    ry: number; 
    rz: number;
    age: number;
    specialMatrix?: Matrix4;
    deathAge?: number;
    barycentricCoordinatesBuffer: WebGLBuffer;
    centerPointsBuffer: WebGLBuffer;
    update(world: World, diff: number): any;
    collisionResponse(entity: Entity): number;
    visible: number;
    cycleLength: number;
    side?: number;
    ignoreGravity?: number;
}

interface Surface extends EntityBase {
    isMonster: 0; 
    normal: Vector3;
    gridNormal: Vector3;
    points: Vector2[];
    worldToPoints: Matrix4;
    pointsToWorld: Matrix4;
    worldToPointsRotation: Matrix4;
    pointsToWorldRotation: Matrix4;
}

type Entity = Monster | Surface;

interface MonsterGenerator {
    (
        seed: number,
        x: number, 
        y: number, 
        z: number, 
        radius: number
    ): Monster;
}

function monsterGeneratorFactory(gl: WebGLRenderingContext): MonsterGenerator {

    let nextId = 0;

    let fillColors = [
        [.8, .3, .3], 
        [.2, .5, .2], 
        [.3, .3, .8], 
        [.1, .4, .4]  
    ]

    let lineColors = [
        [1, .2, .2], 
        [.2, 1, .2], 
        [.2, .2, 1], 
        [0, 1, 1]
    ]

    let bounds = function(this: Monster): Rect3 {
        return {
            min: [this.x - this.radius, this.y - this.radius, this.z - this.radius], 
            max: [this.x + this.radius, this.y + this.radius, this.z + this.radius]
        }
    };

    function shift(bits: number, out: number[]): number {
        let mask = Math.pow(2, bits) - 1;
        let b = out[0] & mask;
        out[0] >>= bits;
        return b;
    }   

    function fib(i: number) {
        let prev = 1;
        let f = 1;
        while( i ) {
            let p = f;
            f = f + prev;
            prev = p;
            i--;
        }
        return f;
    }

    return function(
        seed: number,
        x: number, 
        y: number, 
        z: number, 
        radius: number
    ): Monster {

        let s = [seed];
        let ringsBase = shift(3, s);
        let rings = fib(ringsBase)%11; // 1, 2, 3, 5, 8, 13(2), 21(10), 34(1)
        let minPointCount = fib(shift(2, s)+1) + Math.max(1, ringsBase-1); // 2, 3, 5, 8 + rings
        let horizontalScale = (shift(1, s)+minPointCount)/(minPointCount+1);
        // TODO we don't have code for the other way 
        let pointExponentIncrease = shift(2, s)/3;
        pointExponentIncrease = 0;
        let equalRingOffset = shift(1, s);
        //equalRingOffset = 1;
        let allowPointyTip = shift(1, s);
        let cycleLength = (shift(5, s)+32) * 66;  
        let maxSpikiness = (shift(2, s))/(14 - rings);
        
        let cycleBase = (shift(4, s)) * Math.PI * 2/minPointCount;

        let patternBits = 2;
        let pattern = shift(patternBits, s);        

        // reset
        s = [seed];

        let colorIndex = shift(2, s);
        let fillColor = fillColors[colorIndex];
        let lineColor = lineColors[colorIndex];
        let lineWidth = 2;

        let rx = shift(1, s) * Math.PI/2;
        let ry = shift(1, s) * Math.PI/2;        

        let updater = function(this: Monster, world: World, diff: number) {
            this.rz = this.age / 5000;
            //this.rx = -this.age / 10000;
            //this.y -= this.age / 1000000;
        }

        // generate
        let positions: number[] = [];
        let indices: number[] = [];
        let barrycentricCoordinates: number[] = [];
        let centerPoints: number[] = [];

        let ringPointCounts: number[] = [];
        let ringAngles: number[] = [];
        let ringDiv: number;
        let angleYOffset: number;
        let tipZ: number;
        let pointyTip = (rings % 2 && minPointCount > 3 
            || !equalRingOffset) && allowPointyTip 
            || rings == 1;
        if( pointyTip ) {
            ringDiv = rings + 1;
            angleYOffset = Math.PI/ringDiv;
            tipZ = radius;
        } else {
            ringDiv = rings;
            angleYOffset = Math.PI/(ringDiv*2);
            tipZ = Math.cos(angleYOffset) * radius;
        }
        let angleY = angleYOffset;
        let pointExponent = 0;
        for( let ring=0; ring<rings; ring++ ) {
            ringAngles.push(angleY);
            ringPointCounts.push(minPointCount * Math.pow(2, pointExponent | 0));
            if( ring < (rings-2)/2 ) {
                pointExponent += pointExponentIncrease;
            } else if (ring > (rings-2)/2) {
                pointExponent -= pointExponentIncrease;
            }
            angleY += Math.PI/ringDiv;
        }
        let ringOffset = 0;
        for( let ring=0; ring<rings; ring++ ) {
            let ringPointCount = ringPointCounts[ring];
            let ringAngleY = ringAngles[ring];
            let nextRingOffset = ringOffset + equalRingOffset;
            let ringRadius = Math.sin(ringAngleY) * radius * horizontalScale/Math.cos(Math.PI/ringPointCount);
            let ringZ = Math.cos(ringAngleY) * radius;
            
            for( let point = 0; point < ringPointCount; point ++ ) {
                let cycleOffset = (point + ring) * cycleBase;
                let nextCycleOffset = ((point+1)%ringPointCount + ring) * cycleBase;
                let ringSpikiness = maxSpikiness*Math.sin(ringAngleY);
                let spikiness = (pattern >> (point)%patternBits)&1?ringSpikiness:0;
                let nextSpikiness = (pattern >> ((point+1)%ringPointCount)%patternBits)&1?ringSpikiness:0;

                let angleZ = ringOffset * Math.PI / ringPointCount + point * Math.PI*2/ringPointCount;  
                let nextAngleZ = angleZ + Math.PI*2/ringPointCount;
                let l = indices.length;
                let rx = Math.cos(angleZ) * ringRadius;
                let ry = Math.sin(angleZ) * ringRadius;
                let nextRx = Math.cos(nextAngleZ) * ringRadius;
                let nextRy = Math.sin(nextAngleZ) * ringRadius;
                if( ring < rings - 1 ) {
                    let nextRingPointCount = ringPointCounts[ring+1];

                    let nextRingAngleY = ringAngles[ring+1];
                    
                    let nextRingCycleOffset = (point + ring + 1) * cycleBase;
                    let nextRingNextCycleOffset = ((point + 1)%nextRingPointCount + ring + 1) * cycleBase;
                    let nextRingRingSpikiness = maxSpikiness * Math.sin(nextRingAngleY);
                    let nextRingSpikiness = (pattern >> (point)%patternBits)&1?nextRingRingSpikiness:0;
                    let nextRingNextSpikiness = (pattern >> ((point + 1)%nextRingPointCount)%patternBits)&1?nextRingRingSpikiness:0;
    
                    let nextRingRadius = Math.sin(nextRingAngleY) * radius * horizontalScale/Math.cos(Math.PI/nextRingPointCount);
                    let nextRingZ = Math.cos(nextRingAngleY) * radius;
                    if( ringPointCount == nextRingPointCount ) {
                        let nextRingAngleZ = nextRingOffset * Math.PI / nextRingPointCount + point * Math.PI*2/nextRingPointCount;
                        let nextRingNextAngleZ = nextRingAngleZ + Math.PI*2 / nextRingPointCount;
                        let nextRingRx = Math.cos(nextRingAngleZ)*nextRingRadius;
                        let nextRingRy = Math.sin(nextRingAngleZ) * nextRingRadius;
                        let nextRingNextRx = Math.cos(nextRingNextAngleZ)*nextRingRadius;
                        let nextRingNextRy = Math.sin(nextRingNextAngleZ) * nextRingRadius;

                        let cx1 = (rx + nextRx + nextRingNextRx) / 3;
                        let cy1 = (ry + nextRy + nextRingNextRy) / 3;
                        let cz1 = (ringZ * 2 + nextRingZ) / 3;

                        let cx2 = (nextRx + nextRingRx + nextRingNextRx) / 3;
                        let cy2 = (nextRy + nextRingRy + nextRingNextRy) / 3;
                        let cz2 = (ringZ + nextRingZ * 2) / 3;

                        indices.push(
                            // face 1
                            l++, l++, l++, 
                            // face 2
                            l++, l++, l++

                        );
                        positions.push(
                            // face 1
                            nextRx, nextRy, ringZ, nextSpikiness,  
                            rx, ry, ringZ, spikiness,  
                            nextRingRx, nextRingRy, nextRingZ, nextRingSpikiness,  
                            // face 2
                            nextRx, nextRy, ringZ, nextSpikiness,  
                            nextRingRx, nextRingRy, nextRingZ, nextRingSpikiness,  
                            nextRingNextRx, nextRingNextRy, nextRingZ, nextRingNextSpikiness,  
                        );
                        let r1 = Math.random();
                        let r2 = Math.random();
                        centerPoints.push(
                            cx1, cy1, cz1, r1,
                            cx1, cy1, cz1, r1, 
                            cx1, cy1, cz1, r1, 

                            cx2, cy2, cz2, r2, 
                            cx2, cy2, cz2, r2, 
                            cx2, cy2, cz2, r2, 
                        );
                        if( equalRingOffset ) {
                            barrycentricCoordinates.push(
                                // face 1
                                1, 0, 0, nextCycleOffset, 
                                0, 1, 0, cycleOffset, 
                                0, 0, 1, nextRingCycleOffset, 
                                // face 2
                                1, 0, 0, nextCycleOffset, 
                                0, 1, 0, nextRingCycleOffset, 
                                0, 0, 1, nextRingNextCycleOffset,
                            );    
                        } else {
                            // remove the center line
                            if( FLAG_CAP_ENDS ) {
                                if( ring == 0 && !pointyTip ) {
                                    barrycentricCoordinates.push(
                                        // face 1
                                        0, 0, 1, nextCycleOffset, 
                                        0, 1, 0, cycleOffset, 
                                        1, 1, 0, nextRingCycleOffset, 
                                    );    
                                } else {
                                    barrycentricCoordinates.push(
                                        // face 1
                                        0, 1, 1, nextCycleOffset, 
                                        1, 1, 0, cycleOffset,
                                        1, 1, 0, nextRingCycleOffset
                                    );    
                                }
                                if( ring == rings - 2 && !pointyTip ) {
                                    barrycentricCoordinates.push(
                                        // face 2
                                        1, 0, 0, nextCycleOffset,
                                        0, 1, 1, nextRingCycleOffset,
                                        0, 0, 1, nextRingNextCycleOffset
                                    );        
                                } else {
                                    barrycentricCoordinates.push(
                                        // face 2
                                        1, 1, 0, nextCycleOffset,
                                        0, 1, 1, nextRingCycleOffset,
                                        1, 1, 0, nextRingNextCycleOffset
                                    );        
                                }
    
                            } else {
                                barrycentricCoordinates.push(
                                    // face 1
                                    0, 1, 1, nextCycleOffset,
                                    1, 1, 0, cycleOffset,
                                    1, 1, 0, nextRingCycleOffset,
                                    // face 2
                                    1, 1, 0, nextCycleOffset,
                                    0, 1, 1, nextRingCycleOffset,
                                    1, 1, 0, nextRingNextCycleOffset
                                );        
                            }
                        }
                    } 

                    angleZ = nextAngleZ;
                }
                // add in the base
                let tips = [];
                if( ring == 0 ) {
                    tips.push(tipZ);
                }
                if( ring == rings - 1 ) {
                    tips.push(-tipZ);
                }
                let tipSpikiness = pointyTip?maxSpikiness:0;
                while( tips.length ) {
                    let tip = tips.splice(0, 1)[0];
                    indices.push( 
                        l++, l++, l++
                    );
                    let cx = (rx + nextRx)/3;
                    let cy = (ry + nextRy)/3;
                    let cz = (ringZ * 2 + tip)/3;
                    let r = Math.random();
                    centerPoints.push(
                        cx, cy, cz, r, 
                        cx, cy, cz, r, 
                        cx, cy, cz, r, 
                    );
                    if( tip > 0 ) {
                        positions.push(
                            rx, ry, ringZ, spikiness,
                            nextRx, nextRy, ringZ, nextSpikiness,
                            0, 0, tip, tipSpikiness
                        );    
                    } else {
                        positions.push(
                            nextRx, nextRy, ringZ, nextSpikiness,
                            rx, ry, ringZ, spikiness, 
                            0, 0, tip, tipSpikiness
                        );    
                    }
                    if( pointyTip ) {
                        if( equalRingOffset ) {
                            barrycentricCoordinates.push(
                                1, 0, 0, tip > 0 ? cycleOffset: nextCycleOffset, 
                                0, 1, 0, tip > 0 ? nextCycleOffset: cycleOffset, 
                                0, 0, 1, ring * cycleBase, 
                            );    
                        } else {
                            barrycentricCoordinates.push(
                                0, 1, 1, tip > 0 ? cycleOffset: nextCycleOffset, 
                                1, 1, 0, tip > 0 ? nextCycleOffset: cycleOffset, 
                                0, 1, 0, ring * cycleBase, 
                            );    
                        }    
                    } else {
                        barrycentricCoordinates.push(
                            0, 1, 0, tip > 0 ? cycleOffset: nextCycleOffset, 
                            0, 1, 0, tip > 0 ? nextCycleOffset: cycleOffset, 
                            1, 0, 1, 0, 
                        );    
                    }

                }
            }
            ringOffset=nextRingOffset;
        }
        
        let barrycentricCoordinatesBuffer = webglCreateArrayBuffer(gl, barrycentricCoordinates);
        let positionBuffer = webglCreateArrayBuffer(gl, positions);
        let centerPointsBuffer = webglCreateArrayBuffer(gl, centerPoints);
        let indicesBuffer = webglCreateElementArrayBuffer(gl, indices);
        
        return {
            isMonster: 1, 
            id: nextId++,
            radius: radius, 
            lineColor: lineColor, 
            lineWidth: lineWidth,
            fillColor: fillColor, 
            x: x, 
            y: y, 
            z: z, 
            update: updater,
            collisionResponse: function(entity: Entity) {
                let result: number;
                if( entity.isMonster && entity.side > this.side ) {
                    result = COLLISION_RESPONSE_DIE;
                } else {
                    result =  COLLISION_RESPONSE_SLIDE;
                }
                return result;
            },
            side: 0,
            age: 0, 
            rx: rx, 
            ry: ry, 
            rz: 0, 
            vx: 0, 
            vy: 0, 
            vz: 0, 
            visible: 1, 
            barycentricCoordinatesBuffer: barrycentricCoordinatesBuffer, 
            indicesBuffer: indicesBuffer, 
            indicesCount: indices.length, 
            positionBuffer: positionBuffer, 
            centerPointsBuffer: centerPointsBuffer,
            bounds: bounds, 
            cycleLength: cycleLength
        }
    }
}
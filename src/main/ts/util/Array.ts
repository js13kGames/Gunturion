function array2dCreate<T>(width: number, height: number, f: (x: number, y: number) => T[]): T[][][] {
    let result: T[][][] = [];
    for(let x=0; x<width; x++ ) {
        let a: T[][] = [];
        for( let y=0; y<height; y++ ) {
            a.push(f(x, y));
        }
        result.push(a);
    }
    return result;
}

function arrayRemove<T>(array: T[], element: T) {
    for( let i=array.length; i>0; ) {
        i--;
        if( array[i] == element ) {
            array.splice(i, 1);
        }
    }
}
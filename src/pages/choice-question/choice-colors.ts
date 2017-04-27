
import { Injectable } from "@angular/core";

@Injectable()
export class Colors {
    public static getPalette(count: number, bipolar: boolean): string[] {      
        switch(count - 1) {
            case 2: return this.unipolar2;
            case 3: return bipolar ? this.bipolar3 : this.unipolar3;                        
            case 4: return this.unipolar4;
            case 5: return bipolar ? this.bipolar5 : this.unipolar5;
            case 6: return this.unipolar6;
            case 7: return bipolar ? this.bipolar7 : this.unipolar7;
            default: return this.unipolar5;
        }
    }

    static unipolar7 = [
     "#B3B3B3",  // no comment
     "#057832",  // very positive
     "#0AAA4B",  // positive
     "#82C89B",  // slightly positive
     "#E0F3F8",  // neutral
     "#E8BB92",  // slightly negative
     "#F28244",  // negative 
     "#BE1919"  // very negative
    ];

   static unipolar6 = [   
     "#B3B3B3",  // no comment
     "#057832",  // very positive
     "#0AAA4B",  // positive
     "#82C89B",  // slightly positive    
     "#E8BB92",  // slightly negative
     "#F28244",  // negative 
     "#BE1919"  // very negative
    ];

    static unipolar5 = [  
     "#B3B3B3",  // no comment
     "#057832",  // very positive
     "#0AAA4B",  // positive
     "#E0F3F8",  // neutral
     "#F28244",  // negative 
     "#BE1919"  // very negative
    ];

    static unipolar4 = [  
     "#B3B3B3",  // no comment  
     "#057832",  // very positive
     "#0AAA4B",  // positive
     "#F28244",  // negative 
     "#BE1919"  // very negative
    ]

    static unipolar3 = [    
        "#B3B3B3",  // no comment  
        "#057832",  // very positive
        "#E0F3F8",  // neutral
        "#BE1919"  // very negative
    ]

    static unipolar2 = [ 
        "#B3B3B3",  // no comment      
        "#057832",  // 1 very positive
        "#BE1919"  // 2 very negative
    ]

    static bipolar3 = [ 
        "#B3B3B3",  // no comment     
        "#057832", // 1
        "",
        "#F28244", // 3
    ]

    static bipolar5 = [ 
        "#B3B3B3",  // no comment     
        "#057832", // 1
        "",
        "#E8BB92", // 3
        "",
        "#BE1919"
    ]

    static bipolar7 = [ 
        "#B3B3B3",  // no comment    
        "#057832", // 1
        "",
        "#E8BB92", // 3
        "",
        "#F28244", // 5
        "",
        "#BE1919", // 7
    ]
    
}
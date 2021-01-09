import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("product_candles")
export class ProductCandle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    time: number;

    @Column("float")
    low: number;

    @Column("float")
    high: number;

    @Column("float")
    open: number;

    @Column("float")
    close: number;

    @Column("float")
    volume: number;

    constructor(
        time: number,
        low: number,
        high: number,
        open: number,
        close: number,
        volume: number
    ) {
        this.time = time;
        this.low = low;
        this.high = high;
        this.open = open;
        this.close = close;
        this.volume = volume;
    }
}

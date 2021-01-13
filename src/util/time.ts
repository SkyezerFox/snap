/**
 * Return the number of milliseconds to the next round minute.
 * @param next
 */
export const getMillisecondsUntilNext = (next: "1m" | "5m" | "15m" | "60m") => {
    const time = new Date();

    switch (next) {
        case "1m":
            return (
                60e3 -
                ((time.getSeconds() * 1000 + time.getMilliseconds()) % 60e3)
            );
    }
};

console.log(getMillisecondsUntilNext("1m"));

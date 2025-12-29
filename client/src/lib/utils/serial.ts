/**
 * Web Serial API Utility for Scale Integration
 * This utility allows the browser to connect directly to RS-232 scales.
 */

export interface SerialOptions {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: "none" | "even" | "odd";
    bufferSize?: number;
    flowControl?: "none" | "hardware";
}

export interface ParsedReading {
    weight: number;
    unit: string;
    isStable: boolean;
    raw: string;
}

export class WebSerialScale {
    private port: any | null = null;
    private reader: any | null = null;
    private keepReading: boolean = false;
    private onDataCallback: ((reading: ParsedReading) => void) | null = null;
    private onErrorCallback: ((error: Error) => void) | null = null;

    constructor() { }

    /**
     * Check if Web Serial is supported by the browser
     */
    static isSupported(): boolean {
        return typeof window !== "undefined" && "serial" in navigator;
    }

    /**
     * Request permission and connect to a serial port
     */
    async connect(options: SerialOptions = { baudRate: 9600 }): Promise<boolean> {
        if (!WebSerialScale.isSupported()) {
            throw new Error("Web Serial API is not supported by this browser.");
        }

        try {
            // 1. Request port from user
            this.port = await (navigator as any).serial.requestPort();

            // 2. Open port
            await this.port.open(options);

            // 3. Start reading loop
            this.startReading();

            return true;
        } catch (error: any) {
            console.error("Serial Connection Error:", error);
            if (this.onErrorCallback) this.onErrorCallback(error);
            throw error;
        }
    }

    /**
     * Disconnect and close the port
     */
    async disconnect(): Promise<void> {
        this.keepReading = false;

        if (this.reader) {
            await this.reader.cancel();
            this.reader = null;
        }

        if (this.port) {
            await this.port.close();
            this.port = null;
        }
    }

    /**
     * Internal reading loop
     */
    private async startReading() {
        if (!this.port) return;

        this.keepReading = true;
        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (this.port.readable && this.keepReading) {
                this.reader = this.port.readable.getReader();

                try {
                    while (true) {
                        const { value, done } = await this.reader.read();
                        if (done) break;

                        // Append new data to buffer
                        buffer += decoder.decode(value);

                        // Process complete lines (ending with \r, \n, or \r\n)
                        const lines = buffer.split(/[\r\n]+/);

                        // Keep the last incomplete fragment in buffer
                        // But limit buffer size to 10KB to prevent lag/memory leaks
                        const lastFragment = lines.pop() || "";
                        buffer = lastFragment.length > 10240 ? "" : lastFragment;

                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (trimmedLine) {
                                const parsed = this.parseScaleData(trimmedLine);
                                if (parsed && this.onDataCallback) {
                                    this.onDataCallback(parsed);
                                }
                            }
                        }
                    }
                } catch (error: any) {
                    console.error("Serial Read Error:", error);
                    if (this.onErrorCallback) this.onErrorCallback(error);
                } finally {
                    this.reader.releaseLock();
                }
            }
        } catch (error: any) {
            console.error("Serial Fatal Error:", error);
            if (this.onErrorCallback) this.onErrorCallback(error);
        }
    }

    /**
     * Parse common RS-232 scale formats
     * Example: "ST,GS,+  185.5 kg"
     */
    private parseScaleData(raw: string): ParsedReading | null {
        try {
            // 1. Check stability
            // Many scales prefix with 'ST' for Stable, 'US' for Unstable
            const isStable = raw.includes("ST") || !raw.includes("US");

            // 2. Extract weight number
            // Match numbers like 185.5, -185.5, +185.5
            const weightMatch = raw.match(/([-+]?\d+\.?\d*)/);
            if (!weightMatch) return null;

            const weight = parseFloat(weightMatch[1]);
            if (isNaN(weight)) return null;

            // 3. Extract unit
            const unitMatch = raw.match(/(kg|g|t|lb)/i);
            const unit = unitMatch ? unitMatch[1].toLowerCase() : "kg";

            return {
                weight,
                unit,
                isStable,
                raw
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Set callback for new data
     */
    onData(callback: (reading: ParsedReading) => void) {
        this.onDataCallback = callback;
    }

    /**
     * Set callback for errors
     */
    onError(callback: (error: Error) => void) {
        this.onErrorCallback = callback;
    }
}

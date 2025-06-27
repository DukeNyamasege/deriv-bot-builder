// Performance monitoring utilities
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, number> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    // Mark the start of a performance measurement
    mark(name: string): void {
        if (typeof performance !== 'undefined') {
            performance.mark(`${name}-start`);
        }
        this.metrics.set(`${name}-start`, Date.now());
    }

    // Measure the time since mark was called
    measure(name: string): number {
        const startTime = this.metrics.get(`${name}-start`);
        if (!startTime) {
            console.warn(`No start mark found for ${name}`);
            return 0;
        }

        const duration = Date.now() - startTime;
        this.metrics.set(name, duration);

        if (typeof performance !== 'undefined') {
            try {
                performance.mark(`${name}-end`);
                performance.measure(name, `${name}-start`, `${name}-end`);
            } catch (e) {
                // Ignore performance API errors
            }
        }

        return duration;
    }

    // Get all metrics
    getMetrics(): Record<string, number> {
        const result: Record<string, number> = {};
        this.metrics.forEach((value, key) => {
            if (!key.endsWith('-start')) {
                result[key] = value;
            }
        });
        return result;
    }

    // Log performance metrics to console
    logMetrics(): void {
        const metrics = this.getMetrics();
        console.group('🚀 Performance Metrics');
        Object.entries(metrics).forEach(([name, duration]) => {
            const color = duration < 1000 ? 'green' : duration < 3000 ? 'orange' : 'red';
            console.log(`%c${name}: ${duration}ms`, `color: ${color}`);
        });
        console.groupEnd();
    }

    // Monitor Core Web Vitals
    monitorWebVitals(): void {
        if (typeof window === 'undefined') return;

        // First Contentful Paint
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
                }
            }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`🖼️ Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value;
                }
            }
            console.log(`📐 Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
        }).observe({ entryTypes: ['layout-shift'] });
    }
}

// Utility functions for common performance measurements
export const perf = PerformanceMonitor.getInstance();

// Decorator for measuring function execution time
export function measureTime(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        const name = `${target.constructor.name}.${propertyName}`;
        perf.mark(name);
        const result = method.apply(this, args);
        
        if (result instanceof Promise) {
            return result.finally(() => {
                perf.measure(name);
            });
        } else {
            perf.measure(name);
            return result;
        }
    };
    return descriptor;
}

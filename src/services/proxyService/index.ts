import RedisService from '../redis';

class ProxyService {
    private url: string;
    private proxyNumber: number;

    constructor(url: string) {
        this.url = url;
        this.proxyNumber = 10;
    }

    public async getProxy(): Promise<number> {
        const proxy = await RedisService.getProxy(this.url);
        return proxy ?? 0;
    }

    public async setProxy(proxy: number): Promise<void> {
        const boundedProxy = proxy % this.proxyNumber;
        await RedisService.setProxy(this.url, boundedProxy);
    }
}

export default ProxyService;

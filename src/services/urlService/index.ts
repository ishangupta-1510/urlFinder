import axios from 'axios';
// import puppeteer from 'puppeteer';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RedisService from '../redis';
import cheerio from 'cheerio';

chromium.use(StealthPlugin());

class UrlService {

    private normalizeUrl(base: string, link: string): string | null {
        try {
            const url = new URL(link, base); // base will fix relative links
            if (url.protocol.startsWith('http')) {
                return url.href;
            }
            return null;
        } catch (e) {
            return null;
        }
    }


    public async testUrl(url: string): Promise<boolean> {
        try {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            ];
            const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': randomUserAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Upgrade-Insecure-Requests': '1',
                    'Referer': 'https://google.com',
                },
                timeout: 15000,
            });
            return response.status >= 200 && response.status < 400;
        }
        catch (error) {
            // console.error(`Error testing URL ${url}:`, error);
            return false;
        }
    }

    public findPatterns(url: string, patterns: string[]): boolean {
        //if the url contain any of the patterns return true
        for (const pattern of patterns) {
            if (url.toLocaleLowerCase().includes(pattern)) {
                return true;
            }
        }
        return false;
    }

    public async urlExtractor(url: string): Promise<string[]> {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        ];

        const locales = ['en-US', 'en-GB', 'fr-FR', 'de-DE'];
        const timezones = ['America/New_York', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];

        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const randomLocale = locales[Math.floor(Math.random() * locales.length)];
        const randomTimezone = timezones[Math.floor(Math.random() * timezones.length)];

        // Initialize Playwright browser
        const browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-http2',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-web-security',
            ],
        });

        const context = await browser.newContext({
            userAgent: randomUserAgent,
            locale: randomLocale,
            timezoneId: randomTimezone,
            ignoreHTTPSErrors: true,
            viewport: {
                width: Math.floor(Math.random() * (1920 - 1024) + 1024),
                height: Math.floor(Math.random() * (1080 - 768) + 768),
            },
        });

        const page = await context.newPage();

        try {
            console.log(`Extracting URLs from ${url} using Playwright`);
            page.setDefaultNavigationTimeout(30000);
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await page.content();

            const links = await page.evaluate(() =>
                Array.from(document.querySelectorAll('a')).map((link) => link.href)
            );

            return links;
        } catch (error) {
            console.error(`Error extracting URLs from ${url} using Playwright:`, error);

            // Fallback to Cheerio
            console.log(`Falling back to Cheerio for URL extraction from ${url}`);
            try {
                let response;
                try {
                    response = await axios.get(url, {
                        headers: {
                            'User-Agent': randomUserAgent,
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Upgrade-Insecure-Requests': '1',
                            'Referer': 'https://google.com',
                        },
                        timeout: 8000,
                    });
                } catch (error) {
                    console.error(`Error fetching ${url} with axios:`, error);
                    throw new Error(`Failed to fetch ${url} with axios`);
                }

                if (!response || !response.data) {
                    throw new Error('Failed to fetch URL');
                }

                const $ = cheerio.load(response.data);
                const links = $('a')
                    .map((_, element) => $(element).attr('href'))
                    .get();

                return links;
            } catch (cheerioError) {
                console.error(`Error extracting URLs from ${url} using Cheerio:`, cheerioError);
                throw new Error(
                    `Failed to extract URLs from ${url} using both Playwright and Cheerio`
                );
            }
        } finally {
            await browser.close();
        }
    }

    public async getProductUrls(url: string, hardCheck: boolean = false): Promise<string[]> {
        const links = await this.urlExtractor(url);

        const patterns = [
            '/products/', '/items/', '/shop/', '/categories', '/p/', '/pd/',
            '/collections/', '/c/', 'men', 'women', 'mens', 'womens', 'kids'
        ];

        const absoluteLinks = links
            .map(link => this.normalizeUrl(url, link))
            .filter((link): link is string => link !== null);

        const filteredLinks = absoluteLinks.filter(link => this.findPatterns(link, patterns));

        if (!hardCheck) {
            return filteredLinks;
        }

        const productUrls = await Promise.allSettled(
            filteredLinks.map(async (link) => {
                try {
                    return (await this.testUrl(link)) ? link : null;
                } catch (error) {
                    return null;
                }
            }
            )
        );
        console.log(`Product URLs: ${productUrls}`);

        const successes = productUrls
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

        const failures = productUrls
            .filter(result => result.status === 'rejected')
            .map(result => result.reason);

        return successes.filter((link): link is string => link !== null);
    }

}

export default new UrlService();
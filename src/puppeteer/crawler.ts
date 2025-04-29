import puppeteer, { Browser, KnownDevices, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

interface Merchant {
  name: string;
  category: string;
  address: string;
  kakao_map_url?: string;
}

export class Crawler {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init(): Promise<void> {
    const device = KnownDevices['iPhone 15 Pro Max'];
    this.browser = await puppeteer.launch({
      browser: 'chrome',
      headless: false,
      devtools: true,
      // slowMo: 100,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    this.page = await this.browser.newPage();
    this.page.emulate(device);
    await this.page.setViewport({
      width: device.viewport.width,
      height: device.viewport.height,
      deviceScaleFactor: device.viewport.deviceScaleFactor,
      isMobile: true,
    });
    await this.page.goto(
      'https://www.shinhancard.com/mob/MOBFM204N/MOBFM204R11.shc'
    );
  }

  async getLocations(): Promise<string[]> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForSelector('button[title="지역 시/구/군 선택"]');
    await this.page.click('button[title="지역 시/구/군 선택"]');
    const locations = await this.page.$$eval(
      // .ui_select_list 에 떠있는 모든 지역을 가져온다.
      '.ui_select_list > li > a',
      (elements) => elements.map((el) => el.textContent || '')
    );
    return locations.filter(Boolean);
  }

  async getCategories(): Promise<string[]> {
    if (!this.page) throw new Error('Browser not initialized');

    const categories = await this.page.$$eval(
      '#mCSB_3_container > ul > li > a',
      (elements) => elements.map((el) => el.textContent || '')
    );

    return categories
      .filter(Boolean)
      .filter((category) => category !== '업종선택');
  }

  async getMerchantsByCategory(category: string): Promise<Merchant[]> {
    if (!this.page) throw new Error('Browser not initialized');
    const merchants: Merchant[] = [];

    try {
      const categoryElement = await this.page.waitForSelector(
        `xpath/.//li[@class='ui_select_option']/a[text()='${category}']`,
        { timeout: 5000 }
      );
      if (!categoryElement) {
        throw new Error(`카테고리 '${category}' 요소를 찾을 수 없습니다.`);
      }
      await categoryElement.evaluate((b) => (b as any).click());

      // 검색 버튼 클릭
      this.page.click(
        "xpath/.//button[@class='btn line_darkgray'][./span[text()='검색']]"
      );
      await this.page.waitForNetworkIdle();

      // 더보기가 더이상 나오지 않을때까지 클릭
      while (true) {
        // 다음 페이지 확인
        const btnMoreDiv = await this.page.$('#btnMore');
        if (!btnMoreDiv) break;

        const isHidden = await btnMoreDiv.evaluate(
          (el) => window.getComputedStyle(el).display === 'none'
        );
        if (isHidden) break;

        const nextButton = await btnMoreDiv.$('button');
        if (!nextButton) break;

        await nextButton.focus();
        await nextButton.scrollIntoView();
        nextButton.evaluate((b) => (b as any).click());
        await this.page.waitForNetworkIdle();
      }
      // 검색 결과 확인

      // 가맹점 정보 추출
      const merchantElements = await this.page.$$(
        'div.sungnam_franshise_list > ul'
      );

      const newMerchantsData = await Promise.all(
        merchantElements.map(async (merchantElement) => {
          // 각 ul 내부의 li 요소에서 정보 추출
          const liElement = await merchantElement.$('li');
          if (!liElement) return null;

          const name = await liElement.$eval(
            'em.name',
            (el) => el.textContent || ''
          );
          const type = await liElement.$eval(
            'span.type',
            (el) => el.textContent || ''
          );
          const address = await liElement.$eval(
            'span.address',
            (el) => el.textContent || ''
          );

          // console.log({ name, type, address });

          return {
            name,
            type,
            category,
            address,
          };
        })
      );

      // null 값 필터링
      const validMerchants = newMerchantsData.filter(
        (merchant) => merchant !== null
      );
      console.log({ validMerchants });
      merchants.push(...validMerchants);
    } catch (error) {
      console.error(`카테고리 '${category}' 처리 중 오류 발생:`, error);
    }

    return merchants;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// 크롤러 실행 함수
async function run() {
  const crawler = new Crawler();
  try {
    // 크롤러 초기화
    await crawler.init();
    console.log('크롤러가 초기화되었습니다.');

    // 카테고리 목록 가져오기
    const categories = await crawler.getCategories();
    console.log('수집된 카테고리:', categories);

    let allMerchants: Merchant[] = [];

    // 각 카테고리별로 가맹점 정보 수집
    for (const category of categories) {
      console.log(`\n${category} 카테고리 수집 시작...`);
      const merchants = await crawler.getMerchantsByCategory(category);
      console.log(
        `${category} 카테고리에서 ${merchants.length}개의 가맹점 정보를 수집했습니다.`
      );

      allMerchants = allMerchants.concat(merchants);
    }

    console.log('\n전체 수집 결과:');
    console.log(`총 ${allMerchants.length}개의 가맹점 정보가 수집되었습니다.`);
    // 데이터 디렉토리 생성
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // 가맹점 데이터를 JSON 파일로 저장
    const filePath = path.join(dataDir, 'merchants.json');
    await fs.writeFile(filePath, JSON.stringify(allMerchants, null, 2), 'utf8');
    console.log(`\n가맹점 데이터가 ${filePath}에 저장되었습니다.`);
  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
  } finally {
    await crawler.close();
    console.log('\n크롤러가 종료되었습니다.');
  }
}

// 크롤러 실행
run();

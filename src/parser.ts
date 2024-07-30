import puppeteer from 'puppeteer';
import * as fs from "node:fs";

async function fetchAvitoData(url: string) {
    const browser = await puppeteer.launch({ headless: false }); // Запуск браузера в видимом режиме
    const page = await browser.newPage();

    // Установка user agent для эмуляции обычного браузера
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    // Загрузка куки из файла
    // const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    // await page.setCookie(...cookies);
    // Переход по URL
    const pageAdvert = await page.goto(url);
    console.log(pageAdvert);

    // Получение данных со страницы
    const data = await page.evaluate(() => {
        // Здесь вы можете извлечь необходимые данные из страницы
        // const title = document.querySelector('h1').innerText;
        // const price = document.querySelector('.price-value').innerText;
        return;
    });

    console.log(data);

    // await browser.close();
}

fetchAvitoData('https://www.avito.ru/krasnodar/avtomobili/hyundai_santa_fe_2.4_at_2012_185300km_4113548334');

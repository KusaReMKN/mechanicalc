'use strict';

/**
 * 機械式計算機
 * @class
 */
class MechaniCalc {
    /**
     * アキュムレータ
     * @type { number[] }
     */
    #a;

    /**
     * カウンタ
     * @type { number[] }
     */
    #c;

    /**
     * データ
     * @type { number[] }
     */
    #d;

    /**
     * アキュムレータに対するデータのシフト量
     * @type { number }
     */
    #shift;

    /**
     * カウント方向
     * @type { '*' | '-' | '/' }
     */
    #dir;

    /**
     * 加減算でベルが鳴ると時に真（手動でクリアする）
     */
    #bell;

    /**
     * レジスタを正規化するヘルパメソッド
     * @param { number } _ - 未使用
     * @param { number } i - メンバ番号
     * @param { number[] } v - 正規化対象の配列
     */
    #normaliser(_, i, v) {
        // XXX: 考え方を単純化するためにループを利用しているが、遅い
        // 正の方向
        while (v[i+0] > 9) {
            v[i+0] -= 10;
            if (i+1 < v.length)
                v[i+1]++;
        }
        // 負の方向
        while (v[i+0] < 0) {
            v[i+0] += 10;
            if (i+1 < v.length)
                v[i+1]--;
        }
    }

    /**
     * レジスタを正規化してベルを鳴らすヘルパメソッド
     * @param { number } _ - 未使用
     * @param { number } i - メンバ番号
     * @param { number[] } v - 正規化対象の配列
     */
    #normaliserBell(_, i, v) {
        // XXX: 考え方を単純化するためにループを利用しているが、遅い
        // 正の方向
        while (v[i+0] > 9) {
            v[i+0] -= 10;
            if (i+1 < v.length)
                v[i+1]++;
            else
                this.#bell = true;
        }
        // 負の方向
        while (v[i+0] < 0) {
            v[i+0] += 10;
            if (i+1 < v.length)
                v[i+1]--;
            else
                this.#bell = true;
        }
    }

    /**
     * レジスタをクリアするためのヘルパメソッド
     * @param { number } _ - 未使用
     * @param { number } i - メンバ番号
     * @param { number[] } v - クリア対象の配列
     */
    #cleaner(_, i, v) {
        v[i] = 0;
    }

    constructor(aw = 21, cw = 11, dw = 10) {
        this.#a = Array(aw).fill(0);
        this.#c = Array(cw).fill(0);
        this.#d = Array(dw).fill(0);
        this.#shift = 0;
        this.#dir = '-';
        this.#bell = false;
    }

    /**
     * アキュムレータをクリアする
     */
    clearA() {
        this.#a.forEach(this.#cleaner);
    }

    /**
     * カウンタをクリアする
     */
    clearC() {
        this.#c.forEach(this.#cleaner);
        this.#dir = '-';
    }

    /**
     * データをクリアする
     */
    clearD() {
        this.#d.forEach(this.#cleaner);
    }

    /**
     * 右側にデータをロードする
     * @param { number[] } x - ロードするデータ
     */
    loadRight(x) {
        this.clearD();
        x.toReversed().forEach((e, i) => {
            if (i < this.#d.length)
                this.#d[i] = e;
        });
        this.#d.forEach(this.#normaliser);
    }

    /**
     * 左側にデータをロードする
     * @param { number[] } x - ロードするデータ
     */
    loadLeft(x) {
        // x を正規化して最小の長さにした t を用意する
        const t = Array(this.#d.length).fill(0);
        x.toReversed().forEach((e, i) => {
            if (i < t.length)
                t[i] = e;
        });
        t.forEach(this.#normaliser);
        while (t.at(-1) === 0)
            t.pop();

        // ロードする
        this.clearD();
        t.forEach((e, i) => {
            const k = i + this.#d.length - t.length;
            if (k < this.#d.length)
                this.#d[k] = e;
        });
        this.#d.forEach(this.#normaliser);
    }

    /**
     * アキュムレータをロードする
     */
    loadA() {
        this.clearD();
        this.#d.forEach((_, i) => {
            const k = i + this.#shift;
            if (k < this.#a.length)
                this.#d[i] = this.#a[k];
        });
        this.clearA();
    }

    /**
     * アキュムレータにデータを加算する
     */
    add() {
        // 方向が未定であったらかけ算方向に確定
        if (this.#dir === '-')
            this.#dir = '*';
        // 各桁足し込み
        this.#d.forEach((e, i) => {
            const k = i + this.#shift;
            if (k < this.#a.length)
                this.#a[k] += e;
        });
        // カウント
        if (this.#shift < this.#c.length) {
            if (this.#dir === '*')
                this.#c[this.#shift]++;
            if (this.#dir === '/')
                this.#c[this.#shift]--;
            this.#c.forEach(this.#normaliser);
        }
        // 正規化
        this.#a.forEach(this.#normaliserBell, this);
    }

    /**
     * アキュムレータにデータを減算する
     */
    sub() {
        // 方向が未定であったらかけ算方向に確定
        if (this.#dir === '-')
            this.#dir = '/';
        // 各桁引き込み
        this.#d.forEach((e, i) => {
            const k = i + this.#shift;
            if (k < this.#a.length)
                this.#a[k] -= e;
        });
        // カウント
        if (this.#shift < this.#c.length) {
            if (this.#dir === '*')
                this.#c[this.#shift]--;
            if (this.#dir === '/')
                this.#c[this.#shift]++;
            this.#c.forEach(this.#normaliser);
        }
        // 正規化
        this.#a.forEach(this.#normaliserBell, this);
    }

    /**
     * 右に一桁ズラす
     * @returns { boolean } ズラせたときに真
     */
    shiftRight() {
        const prevShift = this.#shift;
        if (this.#shift < this.#c.length-1)
            this.#shift++;
        return prevShift !== this.#shift;
    }

    /**
     * 左に一桁ズラす
     * @returns { boolean } ズラせたときに真
     */
    shiftLeft() {
        const prevShift = this.#shift;
        if (this.#shift > 0)
            this.#shift--;
        return prevShift !== this.#shift;
    }

    /**
     * 右にズラしきる
     */
    fullRight() {
        this.#shift = this.#c.length-1;
    }

    /**
     * 左にズラしきる
     */
    fullLeft() {
        this.#shift = 0;
    }

    /**
     * ベルをクリアする
     */
    clearBell() {
        this.#bell = false;
    }

    /**
     * アキュムレータを得る
     * @returns { number[] } アキュムレータのコピー
     */
    getA() {
        return this.#a.toReversed();
    }

    /**
     * カウンタを得る
     * @returns { number[] } カウンタのコピー
     */
    getC() {
        return this.#c.toReversed();
    }

    /**
     * データを得る
     * @returns { number[] } データのコピー
     */
    getD() {
        return this.#d.toReversed();
    }

    /**
     * シフト量を得る
     * @return { number } シフト量
     */
    getShift() {
        return this.#shift;
    }

    /**
     * カウント方向を得る
     * @return { string } カウント方向
     */
    getDir() {
        return this.#dir;
    }

    /**
     * ベルが鳴ったのかを得る
     * @return { boolean } ベルが鳴ったのか
     */
    getBell() {
        return this.#bell;
    }

    debug() {
        console.debug(`a = ${this.#a.toReversed().join()}`);
        console.debug(`c = ${this.#c.toReversed().join()}`);
        console.debug(`d = ${this.#d.toReversed().join()}`);
        console.debug(`shift = ${this.#shift}`);
        console.debug(`dir = ${this.#dir}`);
        console.debug(`bell = ${this.#bell}`);
    }
};

// ex: se et ts=4 :

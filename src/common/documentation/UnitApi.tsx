import {h} from 'preact';

export const UnitApi = () => (
    <div>
        <section>
            <section class="action">
                <div class="signature">
                    goTo(x: number, y: number)
                </div>
                <div class="description">
                    Переход на клетку <span class="attr">x</span>, <span class="attr">y</span>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    relativeGoTo(x: number, y: number)
                </div>
                <div class="description">
                    Переход на клетку <span class="attr">x</span>, <span class="attr">y</span> <strong>относительно позиции юнита</strong>
                    <div class="exclamation">для правого игрока перемещения влево будут с отрицательным <span class="attr">x</span></div>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    goToEnemyAndHit(id: string)
                </div>
                <div class="description">
                    Переход в сторону противника по <span class="attr">id</span> и попытка атаки, если это возможно
                    <div class="exclamation"><span class="class">пехотинец</span> атакует только если может дотянуться до противника</div>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    shoot(id: string)
                </div>
                <div class="description">
                    Стрелковая атака противника по <span class="attr">id</span>
                    <div class="exclamation">применимо только к <span class="class">стрелкам</span></div>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    spell(id: string)
                </div>
                <div class="description">
                    Магическая атака противника по <span class="attr">id</span>
                    <div class="exclamation">применимо только к <span class="class">магам</span></div>
                </div>
            </section>

            {/*<section class="action">*/}
                {/*<div class="signature">*/}
                    {/*heal(id: string)*/}
                {/*</div>*/}
                {/*<div class="description"></div>*/}
            {/*</section>*/}

            <section class="action">
                <div class="signature">
                    say(text: string)
                </div>
                <div class="description">
                    Сказать что-нибудь <span class="attr">text</span>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    attackRandom()
                </div>
                <div class="description">
                    Берсерк! Случайный выбор юнита на карте и атака!

                    <div class="exclamation">атакует всех кроме юнитов с таким же <span class="attr">id</span></div>
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    isShooter(): boolean
                </div>
                <div class="description">
                    Проверка, является ли юнит стрелком
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    isMagician(): boolean
                </div>
                <div class="description">
                    Проверка, является ли юнит магом
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    isInfantry(): boolean
                </div>
                <div class="description">
                    Проверка, является ли юнит пехотинцем
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    is(id: string): boolean
                </div>
                <div class="description">
                    Возвращает true если ID юнита равен <span class="attr">id</span>
                </div>
            </section>
        </section>
    </div>
)
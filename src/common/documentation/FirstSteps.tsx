import {h} from 'preact';

export const FirstSteps = () => (
    <div>
        <section>
            <section>

                <div className="signature flex-row flex-align-center">
                    <div>
                        У нас есть 2 юнита: <span class="color-yellow">'CSS'</span> и <span class="color-yellow">'PWA'</span>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/css_unit.png" height="80" alt=""/>
                        <img src="/img/pwa_unit.png" height="80" className="ml-20" alt=""/>
                    </div>
                </div>

                <div className="signature flex-row flex-align-center">
                    <div>
                        У противника: <span class="color-yellow">'CSS'</span> и <span class="color-yellow">'$'</span>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/css_unit.png" height="80" alt=""/>
                        <img src="/img/$_unit.png" height="80" className="ml-20" alt=""/>
                    </div>
                </div>

                <p>
                    * Это <span className="color-yellow">ID</span> юнитов которые вам нужно использовать в коде
                </p>

            </section>

            <section>
                <p>Если заглянуть в характеристики персонажей:</p>
                <ul>
                    <li>Стрелковые атаки будут менее эффективны против стрелков (<span class="color-yellow">'$'</span>)</li>
                    <li>Чтобы нанести больше урона стрелкам надо подойти ближе к цели</li>
                    <li>У нас есть один пехотинец (<span class="color-yellow">'CSS'</span>) с ближней атакой</li>
                </ul>
            </section>

            <section class="signature">
                <p>Как написать более-менее эффективный скрипт:</p>
                <video src="/img/scripting_guide.mov" width="600" controls />
            </section>

            <section>
                <ul>
                    <li>Нажать "Сгенерировать пример кода", чтобы сразу получить стартовый код для нашей армии</li>
                    <li>Подвести <span class="color-yellow">'PWA'</span> ближе к противнику, чтобы наносить больше урона</li>
                    <li>
                        Ближнюю атаку направить на <span class="color-yellow">'$'</span> а стрелковую на &mdash;
                        <span class="color-yellow">'CSS'</span>
                    </li>
                </ul>
            </section>

            <section class="signature">
                Код выполняется всего один раз, за один ход юниты не могут
                дойти до персоанажа или полностью убить его за один выстрел
                потому накидывайте по-больше действий на юнитов
            </section>

        </section>
    </div>
)
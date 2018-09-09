import {h} from 'preact';

export const FirstSteps = () => (
    <div>
        <section>
            <section>
                <p>
                    Дано:
                </p>
                <ul>
                    <li>У нас сть 2 юнита: <span class="attr">CSS</span> и <span class="attr">PWA</span></li>
                    <li>У противника: <span class="attr">CSS</span> и <span class="attr">$</span></li>
                </ul>
            </section>

            <section class="signature">
                <p>
                    <span class="attr">id</span> юнита написан в фиолетовом прямоугольнике у его ног
                </p>
                <p>
                    <img src="/img/tuttorial_id.png" width="100" />
                </p>
            </section>

            <section>
                <p>Если заглянуть в характеристики персонажей:</p>
                <ul>
                    <li>Стрелковые атаки будут менее эффективны против стрелков (<span class="attr">$</span>)</li>
                    <li>Чтобы нанести больше урона стрелкам надо подойти ближе к цели</li>
                    <li>У нас есть один пехотинец (<span class="attr">CSS</span>) с ближней атакой</li>
                </ul>
            </section>

            <section class="signature">
                <video src="/img/scripting_guide.mov" width="600" controls></video>
            </section>

            <section>
                <p>Как написать более-менее эффективный скрипт:</p>
                <ul>
                    <li>Нажать "Сгенерировать пример кода", чтобы сразу получить стартовый код для нашей армии</li>
                    <li>Подвести <span class="attr">PWA</span> ближе к противнику, чтобы наносить больше урона</li>
                    <li>Ближнюю атаку направить на <span class="attr">$</span> а стрелковую на &mdash; <span class="attr">CSS</span></li>
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
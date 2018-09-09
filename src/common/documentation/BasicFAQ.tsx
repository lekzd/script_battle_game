import {h} from 'preact';

export const BasicFAQ = () => (
    <div>
        <section>
            <ol class="main">
                <li>
                    <div class="header">
                        Соберите отряд
                    </div>
                    <div>
                        <video src="/img/select_unit.mov" width="600" autoPlay loop controls />
                    </div>
                    <div>
                        Есть три класса юнитов: маги, стрелки и пехотинцы
                    </div>
                </li>
                <li>
                    <div class="header">
                        Напишите скрипт для своей армии
                    </div>
                    <div>
                        <video src="/img/run_code.mov" width="600" autoPlay loop controls />
                    </div>
                    <div>
                        Код – чистый JS, исполняется последовательно для каждого юнита
                    </div>
                </li>
                <li>
                    <div class="header">
                        Нажмите "Готово!"
                    </div>
                    <div>
                        <img src="/img/tuttorial_send.png" alt="" width="100" />
                    </div>
                    <div>
                        Сражение между игроками начнется только после того как оба будут готовы
                    </div>
                </li>
            </ol>
        </section>

        <section>
            <ul>
                <li>Очередность хода зависит от скорости юнита, быстрые ходят первыми</li>
                <li>Победитель определяется либо после полной победы одной из сторон, либо по очкам после окончания выполнения кода</li>
            </ul>
        </section>
    </div>
)



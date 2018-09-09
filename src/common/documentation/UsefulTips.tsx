import {h} from 'preact';

export const UsefulTips = () => (
    <div>
        <section>
            <ol class="main">
                <li>
                    <div class="header">Каждому свое</div>
                    <p>
                        Разделяйте логику юнитов по классу персонажа
                    </p>
<pre class="code">{
`    if (isShooter()) {
        shoot('ie')
    }
    if (isMagician()) {
        spell('ie')
    }
    if (isInfantry()) {
        goToEnemyAndHit('ie')
    }`}
</pre>

                    <p>или по <span class="attr">id</span></p>
<pre class="code">{
`    if (is('eval')) {
        spell('ie')
    }`}
</pre>
                </li>

                <li>
                    <div class="header">Стрелки – ближе, маги – дальше</div>
                    <p>Чтобы достичь максимальной атаки:</p>
<pre class="code">{
`    // стрелки должны стоять максиум за 5 клеток от противника
    if (isShooter()) {
        relativeGoTo(5, 0)
    }
    // маги – минимум за 10
    if (isMagician()) {
        relativeGoTo(-2, -1)
    }`}
</pre>

                </li>

                <li>
                    <div class="header">Слишком много действий</div>
                    <p>Если юнит противника погиб, а действия на его атаку еще остались...</p>
<pre class="code">{
`     for (i = 0; i < 10; i++) {
         goToEnemyAndHit('dart')
     }
     for (i = 0; i < 10; i++) {
         goToEnemyAndHit('css')
     }`}
</pre>
                    <p>...юнит будет пропускать ходы пока не дойдет до действий атаки еще живого противника, если они еще есть</p>
                </li>

                <li>
                    <div class="header">Списки противников</div>
                    <p>Бывает так, что противник все время меняет юнитов</p>
<pre class="code">{
`    ids = ['ie', '$', 'dart']

    ids.forEach(id => {
        shoot(id)
        shoot(id)
    })`}
</pre>
                    <p>потому их проще записать в массив и менять вместе с ним</p>
                </li>

            </ol>

        </section>
    </div>
)
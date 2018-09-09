import {h} from 'preact';

export const BasicJS = () => (
    <div>
        <section>
            <ol class="main">
                <li>
                    <div class="header">Переменные</div>
                    <div>
<pre class="code">{`
    stepsCount = 10
    enemyIds = ['ie', '$', 'eval', 'dart']`}
</pre>
                    </div>
                </li>
                <li>
                    <div class="header">Цикл</div>
                    <div>
<pre class="code">{`
    for (i = 0; i < 10; i++) {
       shoot('ie')
    }`}
</pre>
                    </div>
                </li>
                <li>
                    <div class="header">Функция</div>
                    <div>
<pre class="code">{`
    function attack(id) {
        if (isShooter()) {
           shoot(id)
        }
        if (isInfantry()) {
            goToEnemyAndHit(id)
        }
    }

    attack('ie')`}
</pre>
                    </div>
                </li>
            </ol>
        </section>
    </div>
)
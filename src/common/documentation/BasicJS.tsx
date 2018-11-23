import {h} from 'preact';

export const BasicJS = () => (
    <div>
        <section>
            <ol class="main">
                <li>
                    <div class="header">Variables</div>
                    <div>
<pre class="code">{`
    stepsCount = 10
    enemyIds = ['ie', '$', 'eval', 'dart']`}
</pre>
                    </div>
                </li>
                <li>
                    <div class="header">For loop</div>
                    <div>
<pre class="code">{`
    for (var i = 0; i < 10; i++) {
       shoot('ie')
    }`}
</pre>
                    </div>
                </li>
                <li>
                    <div class="header">Function</div>
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
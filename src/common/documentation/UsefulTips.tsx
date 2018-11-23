import {h} from 'preact';

export const UsefulTips = () => (
    <div>
        <section>
            <ol class="main">
                <li>
                    <div class="header">Different behavior</div>
                    <p>
                        Separate unit logic by class
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

                    <p>or using <span class="attr">id</span></p>
<pre class="code">{
`    if (is('eval')) {
        spell('ie')
    }`}
</pre>
                </li>

                <li>
                    <div class="header">Shooters – closer, magicians – farther</div>
                    <p>To reach maximal damage:</p>
<pre class="code">{
`    // shooters should have at least 5 cells of distance to enemy
    if (isShooter()) {
        relativeGoTo(5, 0)
    }
    // magicians – at least 10
    if (isMagician()) {
        relativeGoTo(-2, -1)
    }`}
</pre>

                </li>

                <li>
                    <div class="header">Too much actions</div>
                    <p>In case of enemy is killed but unit has actions to attack him...</p>
<pre class="code">{
`     for (i = 0; i < 10; i++) {
         goToEnemyAndHit('dart')
     }
     for (i = 0; i < 10; i++) {
         goToEnemyAndHit('css')
     }`}
</pre>
                    <p>...unit will skip all attack turns for this enemy</p>
                </li>

                <li>
                    <div class="header">Array of enemies</div>
                    <p>Sometimes, opponent changes his units a lot</p>
<pre class="code">{
`    ids = ['ie', '$', 'dart']

    ids.forEach(id => {
        shoot(id)
        shoot(id)
    })`}
</pre>
                    <p>it simpler to store all IDs in array, to can change it fast</p>
                </li>

            </ol>

        </section>
    </div>
)
import {h} from 'preact';

export const FirstSteps = () => (
    <div>
        <section>
            <section>

                <div className="signature flex-row flex-align-center">
                    <div>
                        So, we have 2 units: <span class="color-yellow">'CSS'</span> and <span class="color-yellow">'PWA'</span>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/css_unit.png" height="80" alt=""/>
                        <img src="/img/pwa_unit.png" height="80" className="ml-20" alt=""/>
                    </div>
                </div>

                <div className="signature flex-row flex-align-center">
                    <div>
                        Enemy has: <span class="color-yellow">'CSS'</span> and <span class="color-yellow">'$'</span>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/css_unit.png" height="80" alt=""/>
                        <img src="/img/$_unit.png" height="80" className="ml-20" alt=""/>
                    </div>
                </div>

                <p>
                    * It`s units <span className="color-yellow">ID</span> you need to use in code
                </p>

            </section>

            <section>
                <p>In unit characteristics you can see:</p>
                <ul>
                    <li>Bullet attacks became less effective against shooters (<span class="color-yellow">'$'</span>)</li>
                    <li>It needs keep closer to enemy to make more damage to shooters</li>
                    <li>And also we have on infantry (<span class="color-yellow">'CSS'</span>) with melee attack</li>
                </ul>
            </section>

            <section class="signature">
                <p>How to make effective script:</p>
                <video src="/img/scripting_guide.mov" width="600" controls />
            </section>

            <section>
                <ul>
                    <li>Click "Generate code sample" to get template code for your army</li>
                    <li>Put your <span class="color-yellow">'PWA'</span> closer to enemy, to increase his damage</li>
                    <li>
                        Infantry unit should attack <span class="color-yellow">'$'</span>, shooter should attack
                        <span class="color-yellow">'CSS'</span>
                    </li>
                </ul>
            </section>

            <section class="signature">
                Code will run at least one time. For a one action units can`t
                go to the enemy, or kill them for a one shoot
                Make actions for you units as more as it possible
            </section>

        </section>
    </div>
)
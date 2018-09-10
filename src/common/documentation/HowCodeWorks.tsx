import {h} from 'preact';

export const HowCodeWorks = () => (
    <div>
        <section>
            <ol>
                <li class="mb-10">Весь код исполняется 1 раз ДО начала битвы</li>
                <li class="mb-10">Один и тот же код исполняется для каждого юнита</li>
                <li>далее юниты ходят согласно получившимуся сценарию</li>
            </ol>
            <section>
                <p>Надо ставить условия, чтобы разный код исполнялся для разных юнитов</p>
            </section>

            <div className="signature">
                <div className="mb-20">
                    Можно ставить условия по ID:
                </div>
                <div class="flex-row flex-align-center mb-20">
                    <div>
<pre>
{`if (is('CSS')) {
    ...
}`}
</pre>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/$_unit.png" style="opacity: .3" height="80" alt=""/>
                        <img src="/img/css_unit.png" style="border: 1px solid" height="80" className="ml-20" alt=""/>
                        <img src="/img/pwa_unit.png" style="opacity: .3" height="80" className="ml-20" alt=""/>
                    </div>
                </div>
            </div>

            <div className="signature">
                <div className="mb-20">
                    Или по классу юнита:
                </div>
                <div class="flex-row flex-align-center mb-20">
                    <div>
<pre>
{`if (isShooter()) {
    ...
}`}
</pre>
                    </div>
                    <div className="ml-auto">
                        <img src="/img/$_unit.png" style="border: 1px solid" height="80" alt=""/>
                        <img src="/img/css_unit.png" style="opacity: .3" height="80" className="ml-20" alt=""/>
                        <img src="/img/pwa_unit.png" style="border: 1px solid" height="80" className="ml-20" alt=""/>
                    </div>
                </div>
            </div>
        </section>
    </div>
)
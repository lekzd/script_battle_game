import {h} from 'preact';

export const UnitApi = () => (
    <div>
        <section>
            <section class="action">
                <div class="signature">
                    goTo(x: number, y: number)
                </div>
                <div class="description">
                    Go to cell by <span class="attr">x</span> and <span class="attr">y</span>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    relativeGoTo(x: number, y: number)
                </div>
                <div class="description">
                    Go to cell by <span class="attr">x</span>, <span class="attr">y</span> <strong>relative to unit position</strong>
                    <div class="exclamation">for the right player movements should has negative <span class="attr">x</span></div>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    goToEnemyAndHit(id: string)
                </div>
                <div class="description">
                    Go to enemy by <span class="attr">id</span> and try attack if it possible
                    <div class="exclamation"><span class="class">infantry</span> will attack only in case of it stay near the enemy</div>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    shoot(id: string)
                </div>
                <div class="description">
                    Shoot enemy by <span class="attr">id</span>
                    <div class="exclamation">applies to <span class="class">shooters only</span></div>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    spell(id: string)
                </div>
                <div class="description">
                    Spell cast to enemy by <span class="attr">id</span>
                    <div class="exclamation">applies to <span class="class">magicians only</span></div>
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
                    Say something <span class="attr">text</span>
                </div>
            </section>

            <section class="action">
                <div class="signature">
                    attackRandom()
                </div>
                <div class="description">
                    Berserk! Unit to attack will chosen randomly!

                    <div class="exclamation">attack all except units with same <span class="attr">id</span></div>
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    isShooter(): boolean
                </div>
                <div class="description">
                    Check unit is shooter
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    isMagician(): boolean
                </div>
                <div class="description">
                    Check unit is magician
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    isInfantry(): boolean
                </div>
                <div class="description">
                    Check unit is infantry
                </div>
            </section>

            <section class="getter">
                <div class="signature">
                    is(id: string): boolean
                </div>
                <div class="description">
                    Check unit ID is <span class="attr">id</span>
                </div>
            </section>
        </section>
    </div>
)
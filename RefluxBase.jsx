
import {Component} from "react";

/**
 *  Base class template for react components
 *
 *  + Promisified setState
 *  + Reflux emmiter supported
 *
 *  Typical usage:
 *
 *
 *    class View extends RefluxBase {
 *
 *      constructor(){
 *        super();
 *        this.prebind(["onWelcome", "render"]);
 *        this.listenTo(
 *           Actions.doWelcome
 *           this.onWelcome);
 *      }
 *
 *      onWelcome(greeting){
 *        this.setState({greeting}).then(function(stateChangeResult){
 *            if (stateChangeResult.changed){
 *               self.props.onWelcomCallback && self.props.onWelcomCallback(stateChangeResult.newState.greeting);
 *            }
 *        });
 *      }
 *
 *      render(){
 *        return (
 *            <h1>{this.state.greeting}</h1>
 *        )
 *      }
 *    }
 *
 *
 */
class RefluxBase extends Component {

    /*
     * methods prebind */
    prebind(methods){
       methods.forEach( (m) => this[m] = this[m].bind(this) )
    }

    /* constructor prebinds main methods */
    constructor(){
      super();
      this.prebind([
        "setState",
        "listenTo",
        "componentDidMount",
        "componentWillUnmount",
        "shouldComponentUpdate",
        "componentWillUpdate",
        "componentDidUpdate"
      ]);
    }

    /**
     *  promisified setState, checks if state is changed
     *  and triggers component refresh
     *
     *  @param newState
     *  @return promise
     */
    setState(newState){
      var self = this;
      return new Promise(function(resolve, reject){
          try{
            var changed = false;

            // create replica of component current state
            var oldState = JSON.parse(JSON.stringify(self.state));
            for (var field in newState){
              if (newState.hasOwnProperty(field)){
                  var o = self.state[field];
                  var n = newState[field];
                  if (n !== o){
                    self.state[field] = n;
                    changed = true;
                  }
              }
            }
            // trigger rebrush if only state changes
            if (changed){
              if (self.shouldComponentUpdate(self.props, newState)){
                  self.componentWillUpdate(self.props, newState);
                  self.forceUpdate();
                  self.componentDidUpdate(self.props, oldState);
              }
            }
            resolve({changed: changed, newState: newState, oldState: oldState});
          } catch(e){
            reject(e);
          }
        });
    };


    //
    _listeners = [];

    /**
     *  binds reflux events emmiter and callback
     */
    listenTo(emitter, callback){
      this._listeners.push({
         a: ()=>{this.l = emitter.listen(callback)},
         d: ()=>{this.l && this.l();}
      });
    }

    shouldComponentUpdate(newProps, newState){
      return true;
    }

    componentWillUpdate(newProps, newState){
    }

    componentDidUpdate(oldProps, oldState){
    }

    componentDidMount(){
      this._listeners.map((listener)=>{
        listener.a();
      })
    }

    componentWillUnmount(){
      this._listeners.map((listener)=>{
        listener.d();
      })
      this._listeners = [];
    }
}

export default RefluxBase;
